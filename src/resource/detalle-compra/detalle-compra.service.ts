import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetalleCompraDto } from './dto/create-detalle-compra.dto';
import { UpdateDetalleCompraDto } from './dto/update-detalle-compra.dto';
import { DetalleCompraEntity } from 'src/database/core/detalleCompra.entity';
import { BaseService } from 'src/base-service/base-service.service';
import { FindManyOptions, FindOneOptions, In, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoEntity } from 'src/database/core/producto.entity';

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

  // Get detalles by producto_id
  async getDetallesByProducto(productoId: number): Promise<DetalleCompraEntity[]> {
    return await this.detalleCompraRepository.find({
      where: {
        producto: { id: productoId },
        deleted_at: IsNull()
      },
      relations: ['producto', 'compra'],
    });
  }

  // Create detalle
  async createDetalle(detalleData: CreateDetalleCompraDto): Promise<DetalleCompraEntity> {
    // Verificar que el producto existe y obtener su stock actual
    const producto = await this.productoRepository.findOne({
      where: { id: detalleData.producto_id }
    });

    if (!producto) {
      throw new NotFoundException(`Producto con id ${detalleData.producto_id} no encontrado`);
    }

    // Crear el detalle de compra con todos los datos requeridos
    const detalleToCreate: any = {
      compra: { id: detalleData.compra_id },
      producto: { id: detalleData.producto_id },
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
    const detalle = await this.findById(id);
    if (!detalle) {
      throw new NotFoundException(`Detalle de compra con id ${id} no encontrado`);
    }

    // Filtrar propiedades no pertenecientes a la entidad
    const { isEdit, producto_id, ...detalleDataFiltered } = detalleData as any;

    // Si se cambió el producto, actualizar la relación
    const updateData: any = { ...detalleDataFiltered };
    if (producto_id) {
      updateData.producto = { id: producto_id };
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

  // Get total cantidad vendida de un producto
  async getCantidadVendidaByProducto(productoId: number): Promise<number> {
    const result = await this.detalleCompraRepository
      .createQueryBuilder('detalle')
      .select('SUM(detalle.cantidad)', 'total')
      .where('detalle.producto.id = :productoId', { productoId })
      .andWhere('detalle.deleted_at IS NULL')
      .getRawOne();

    return parseInt(result?.total || '0');
  }

  // Get total ventas (monto) de un producto
  async getTotalVentasByProducto(productoId: number): Promise<number> {
    const result = await this.detalleCompraRepository
      .createQueryBuilder('detalle')
      .select('SUM(detalle.subtotal)', 'total')
      .where('detalle.producto.id = :productoId', { productoId })
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