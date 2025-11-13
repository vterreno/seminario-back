import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetalleCompraDto } from './dto/create-detalle-compra.dto';
import { UpdateDetalleCompraDto } from './dto/update-detalle-compra.dto';
import { DetalleCompraEntity } from 'src/database/core/detalleCompra.entity';
import { BaseService } from 'src/base-service/base-service.service';
import { FindManyOptions, FindOneOptions, In, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { ProductoProveedorEntity } from 'src/database/core/producto-proveedor.entity';

@Injectable()
export class DetalleCompraService extends BaseService<DetalleCompraEntity> {
  findManyOptions: FindManyOptions<DetalleCompraEntity> = {};
  findOneOptions: FindOneOptions<DetalleCompraEntity> = {
    relations: ['producto', 'compra'],
  };

  constructor(
    @InjectRepository(DetalleCompraEntity)
    protected detalleCompraRepository: Repository<DetalleCompraEntity>,
    @InjectRepository(ProductoEntity)
    protected productoRepository: Repository<ProductoEntity>,
    @InjectRepository(ProductoProveedorEntity)
    protected productoProveedorRepository: Repository<ProductoProveedorEntity>,
  ) {
    super(detalleCompraRepository);
  }

  // Get all detalles
  async getAllDetalles(): Promise<DetalleCompraEntity[]> {
    return await this.detalleCompraRepository.find({
      relations: ['producto', 'compra'],
      where: {
        deleted_at: IsNull()
      }
    });
  }

  // Get detalles by compra_id
  async getDetallesByCompra(compraId: number): Promise<DetalleCompraEntity[]> {
    return await this.detalleCompraRepository.find({
      where: {
        compra: { id: compraId },
        deleted_at: IsNull()
      },
      relations: ['producto', 'compra'],
    });
  }

  // Get detalles by producto_proveedor_id
  async getDetallesByProducto(productoProveedorId: number): Promise<DetalleCompraEntity[]> {
    return await this.detalleCompraRepository.find({
      where: {
        producto: { id: productoProveedorId },
        deleted_at: IsNull()
      },
      relations: ['producto', 'compra'],
    });
  }

  // Create detalle
  async createDetalle(detalleData: CreateDetalleCompraDto): Promise<DetalleCompraEntity> {
    let productoProveedor: ProductoProveedorEntity | null = null;
    let productoId: number;

    // Si se proporciona producto_proveedor_id, usarlo directamente
    if (detalleData.producto_proveedor_id) {
      productoProveedor = await this.productoProveedorRepository.findOne({
        where: { id: detalleData.producto_proveedor_id },
        relations: ['producto']
      });

      if (!productoProveedor) {
        throw new NotFoundException(`Relación producto-proveedor con id ${detalleData.producto_proveedor_id} no encontrada`);
      }

      productoId = productoProveedor.producto_id;
    } 
    // Si se proporciona producto_id, usarlo directamente
    else if (detalleData.producto_id) {
      productoId = detalleData.producto_id;
    } 
    else {
      throw new BadRequestException('Debe proporcionar producto_proveedor_id o producto_id');
    }

    // Obtener el producto para actualizar su stock
    const producto = await this.productoRepository.findOne({
      where: { id: productoId }
    });

    if (!producto) {
      throw new NotFoundException(`Producto con id ${productoId} no encontrado`);
    }

    // Crear el detalle de compra con todos los datos requeridos
    // Si tenemos producto_proveedor_id, lo usamos; sino, usamos producto_id
    const detalleToCreate: any = {
      compra: { id: detalleData.compra_id },
      producto: { id: detalleData.producto_proveedor_id || detalleData.producto_id },
      cantidad: detalleData.cantidad,
      precio_unitario: detalleData.precio_unitario,
      subtotal: detalleData.subtotal,
    };

    const detalle = this.detalleCompraRepository.create(detalleToCreate);
    
    const savedDetalle = await this.detalleCompraRepository.save(detalle);

    // Actualizar el stock del producto (SUMAR la cantidad comprada)
    producto.stock += detalleData.cantidad;
    await this.productoRepository.save(producto);

    // Obtener el ID del detalle guardado (TypeScript tiene problemas con el tipo, usamos any)
    const detalleId = (savedDetalle as any).id;

    // Retornar el detalle con las relaciones cargadas
    const detalleCompleto = await this.detalleCompraRepository.findOne({
      where: { id: detalleId },
      relations: ['producto', 'compra'],
    });

    if (!detalleCompleto) {
      throw new NotFoundException(`Error al recuperar el detalle de compra creado`);
    }

    return detalleCompleto;
  }

  // Update detalle
  async updateDetalle(id: number, detalleData: UpdateDetalleCompraDto): Promise<DetalleCompraEntity> {
    // Check if detalle exists
    const detalleActual = await this.detalleCompraRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['producto', 'compra']
    });
    
    if (!detalleActual) {
      throw new NotFoundException(`Detalle de compra con id ${id} no encontrado`);
    }

    // Obtener el producto actual para ajustar el stock
    const productoProveedorActual = await this.productoProveedorRepository.findOne({
      where: { id: detalleActual.producto.id },
      relations: ['producto']
    });

    if (!productoProveedorActual) {
      throw new NotFoundException(`Relación producto-proveedor no encontrada`);
    }

    const productoActual = await this.productoRepository.findOne({
      where: { id: productoProveedorActual.producto_id }
    });

    if (!productoActual) {
      throw new NotFoundException(`Producto no encontrado`);
    }

    // Filtrar propiedades no pertenecientes a la entidad
    const { isEdit, producto_proveedor_id, cantidad, ...detalleDataFiltered } = detalleData as any;

    // Calcular la diferencia de stock si se modifica la cantidad
    if (cantidad !== undefined && cantidad !== detalleActual.cantidad) {
      const diferenciaCantidad = cantidad - detalleActual.cantidad;
      
      // Ajustar el stock del producto según la diferencia
      // Si la nueva cantidad es mayor, sumamos al stock
      // Si la nueva cantidad es menor, restamos del stock
      productoActual.stock += diferenciaCantidad;
      
      // Validar que el stock no quede negativo
      if (productoActual.stock < 0) {
        throw new BadRequestException(
          `No se puede reducir la cantidad. Stock insuficiente. Stock actual: ${productoActual.stock + Math.abs(diferenciaCantidad)}, diferencia solicitada: ${diferenciaCantidad}`
        );
      }
      
      await this.productoRepository.save(productoActual);
    }

    // Si se cambió el producto-proveedor, actualizar la relación y ajustar stocks
    const updateData: any = { ...detalleDataFiltered };
    
    if (producto_proveedor_id && producto_proveedor_id !== detalleActual.producto.id) {
      // Validar que el nuevo producto-proveedor existe
      const nuevoProductoProveedor = await this.productoProveedorRepository.findOne({
        where: { id: producto_proveedor_id },
        relations: ['producto']
      });

      if (!nuevoProductoProveedor) {
        throw new NotFoundException(`Relación producto-proveedor con id ${producto_proveedor_id} no encontrada`);
      }

      const nuevoProducto = await this.productoRepository.findOne({
        where: { id: nuevoProductoProveedor.producto_id }
      });

      if (!nuevoProducto) {
        throw new NotFoundException(`Producto con id ${nuevoProductoProveedor.producto_id} no encontrado`);
      }

      // Devolver la cantidad al stock del producto anterior
      productoActual.stock -= detalleActual.cantidad;
      await this.productoRepository.save(productoActual);

      // Sumar la cantidad al stock del nuevo producto
      const cantidadFinal = cantidad !== undefined ? cantidad : detalleActual.cantidad;
      nuevoProducto.stock += cantidadFinal;
      await this.productoRepository.save(nuevoProducto);

      updateData.producto = { id: producto_proveedor_id };
    }

    if (cantidad !== undefined) {
      updateData.cantidad = cantidad;
    }

    // Update detalle data
    await this.detalleCompraRepository.update(id, updateData);
    return await this.findById(id);
  }

  // Find detalle by id with relations
  async findById(id: number): Promise<DetalleCompraEntity> {
    const detalle = await this.detalleCompraRepository.findOne({
      where: {
        id,
        deleted_at: IsNull()
      },
      relations: ['producto', 'compra'],
    });

    if (!detalle) {
      throw new NotFoundException(`Detalle de compra con id ${id} no encontrado`);
    }

    return detalle;
  }

  // Hard delete single detalle
  async deleteDetalle(id: number): Promise<void> {
    const result = await this.detalleCompraRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Detalle de compra con id ${id} no encontrado`);
    }
  }

  // Bulk hard delete detalles
  async bulkDeleteDetalles(ids: number[]): Promise<void> {
    const detalles = await this.detalleCompraRepository.find({
      where: {
        id: In(ids),
        deleted_at: IsNull()
      }
    });

    if (detalles.length !== ids.length) {
      throw new BadRequestException('Algunos detalles no existen');
    }

    await this.detalleCompraRepository.delete(ids);
  }

  // Soft delete
  async softDeleteDetalle(id: number): Promise<void> {
    const result = await this.detalleCompraRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Detalle de compra con id ${id} no encontrado`);
    }
  }

  // Bulk soft delete
  async bulkSoftDeleteDetalles(ids: number[]): Promise<void> {
    const detalles = await this.detalleCompraRepository.find({
      where: {
        id: In(ids),
        deleted_at: IsNull()
      }
    });

    if (detalles.length !== ids.length) {
      throw new BadRequestException('Algunos detalles no existen');
    }

    await this.detalleCompraRepository.softDelete(ids);
  }

  // Restore soft deleted detalle
  async restoreDetalle(id: number): Promise<DetalleCompraEntity> {
    const result = await this.detalleCompraRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Detalle de compra con id ${id} no encontrado`);
    }
    return await this.detalleCompraRepository.findOne({ where: { id } });
  }

  // Bulk restore soft deleted detalles
  async bulkRestoreDetalles(ids: number[]): Promise<void> {
    const detalles = await this.detalleCompraRepository.find({
      where: {
        id: In(ids)
      },
      withDeleted: true
    });

    if (detalles.length !== ids.length) {
      throw new BadRequestException('Algunos detalles no existen');
    }

    await this.detalleCompraRepository.restore(ids);
  }

  // Delete all detalles by compra_id
  async deleteDetallesByCompra(compraId: number): Promise<void> {
    await this.detalleCompraRepository.delete({
      compra: { id: compraId }
    });
  }

  // Get total cantidad comprada de un producto-proveedor
  async getCantidadCompradaByProducto(productoProveedorId: number): Promise<number> {
    const result = await this.detalleCompraRepository
      .createQueryBuilder('detalle')
      .select('SUM(detalle.cantidad)', 'total')
      .where('detalle.producto.id = :productoProveedorId', { productoProveedorId })
      .andWhere('detalle.deleted_at IS NULL')
      .getRawOne();

    return parseInt(result?.total || '0');
  }

  // Get total ventas (monto) de un producto-proveedor
  async getTotalVentasByProducto(productoProveedorId: number): Promise<number> {
    const result = await this.detalleCompraRepository
      .createQueryBuilder('detalle')
      .select('SUM(detalle.subtotal)', 'total')
      .where('detalle.producto.id = :productoProveedorId', { productoProveedorId })
      .andWhere('detalle.deleted_at IS NULL')
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  // Get productos más vendidos
  async getProductosMasVendidos(limit: number = 10): Promise<any[]> {
    return await this.detalleCompraRepository
      .createQueryBuilder('detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')
      .select('producto.id', 'producto_id')
      .addSelect('producto.nombre', 'producto_nombre')
      .addSelect('SUM(detalle.cantidad)', 'total_vendido')
      .addSelect('SUM(detalle.subtotal)', 'monto_total')
      .where('detalle.deleted_at IS NULL')
      .groupBy('producto.id')
      .addGroupBy('producto.nombre')
      .orderBy('total_vendido', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  // Get detalles con filtro de cantidad mínima
  async getDetallesConCantidadMinima(cantidadMinima: number): Promise<DetalleCompraEntity[]> {
    return await this.detalleCompraRepository
      .createQueryBuilder('detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')
      .leftJoinAndSelect('detalle.compra', 'compra')
      .where('detalle.cantidad >= :cantidadMinima', { cantidadMinima })
      .andWhere('detalle.deleted_at IS NULL')
      .getMany();
  }

  // Validar y calcular subtotal
  calcularSubtotal(cantidad: number, precioUnitario: number): number {
    if (cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }
    if (precioUnitario <= 0) {
      throw new BadRequestException('El precio unitario debe ser mayor a 0');
    }
    return cantidad * precioUnitario;
  }
}