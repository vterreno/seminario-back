import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { detalleVentaEntity } from 'src/database/core/detalleVenta.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { FindManyOptions, FindOneOptions, IsNull, Repository, In } from 'typeorm';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';

@Injectable()
export class DetalleVentaService extends BaseService<detalleVentaEntity> {
  findManyOptions: FindManyOptions<detalleVentaEntity> = {};
  findOneOptions: FindOneOptions<detalleVentaEntity> = {
    relations: ['producto', 'venta'],
  };

  constructor(
    @InjectRepository(detalleVentaEntity)
    protected detalleVentaRepository: Repository<detalleVentaEntity>,
    @InjectRepository(ProductoEntity)
    protected productoRepository: Repository<ProductoEntity>,
  ) {
    super(detalleVentaRepository);
  }

  // Get all detalles
  async getAllDetalles(): Promise<detalleVentaEntity[]> {
    return await this.detalleVentaRepository.find({
      relations: ['producto', 'venta'],
      where: {
        deleted_at: IsNull()
      }
    });
  }

  // Get detalles by venta_id
  async getDetallesByVenta(ventaId: number): Promise<detalleVentaEntity[]> {
    return await this.detalleVentaRepository.find({
      where: {
        venta: { id: ventaId },
        deleted_at: IsNull()
      },
      relations: ['producto', 'venta'],
    });
  }

  // Get detalles by producto_id
  async getDetallesByProducto(productoId: number): Promise<detalleVentaEntity[]> {
    return await this.detalleVentaRepository.find({
      where: {
        producto: { id: productoId },
        deleted_at: IsNull()
      },
      relations: ['producto', 'venta'],
    });
  }

  // Create detalle
  async createDetalle(detalleData: CreateDetalleVentaDto): Promise<detalleVentaEntity> {
    // Verificar que el producto existe y obtener su stock actual
    const producto = await this.productoRepository.findOne({
      where: { id: detalleData.producto_id }
    });

    if (!producto) {
      throw new NotFoundException(`Producto con id ${detalleData.producto_id} no encontrado`);
    }

    // Verificar que hay suficiente stock
    if (producto.stock < detalleData.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para el producto "${producto.nombre}". Stock disponible: ${producto.stock}, cantidad solicitada: ${detalleData.cantidad}`
      );
    }

    // Crear el detalle de venta con todos los datos requeridos
    const detalleToCreate: any = {
      venta: { id: detalleData.venta_id },
      producto: { id: detalleData.producto_id },
      cantidad: detalleData.cantidad,
      precio_unitario: detalleData.precio_unitario,
      subtotal: detalleData.subtotal,
    };

    const detalle = this.detalleVentaRepository.create(detalleToCreate);
    
    const savedDetalle = await this.detalleVentaRepository.save(detalle);

    // Actualizar el stock del producto (restar la cantidad vendida)
    producto.stock -= detalleData.cantidad;
    await this.productoRepository.save(producto);

    // Obtener el ID del detalle guardado (TypeScript tiene problemas con el tipo, usamos any)
    const detalleId = (savedDetalle as any).id;

    // Retornar el detalle con las relaciones cargadas
    const detalleCompleto = await this.detalleVentaRepository.findOne({
      where: { id: detalleId },
      relations: ['producto', 'venta'],
    });

    if (!detalleCompleto) {
      throw new NotFoundException(`Error al recuperar el detalle de venta creado`);
    }

    return detalleCompleto;
  }

  // Update detalle
  async updateDetalle(id: number, detalleData: UpdateDetalleVentaDto): Promise<detalleVentaEntity> {
    // Check if detalle exists
    const detalle = await this.findById(id);
    if (!detalle) {
      throw new NotFoundException(`Detalle de venta con id ${id} no encontrado`);
    }

    // Filtrar propiedades no pertenecientes a la entidad
    const { isEdit, producto_id, ...detalleDataFiltered } = detalleData as any;

    // Si se cambió el producto, actualizar la relación
    const updateData: any = { ...detalleDataFiltered };
    if (producto_id) {
      updateData.producto = { id: producto_id };
    }

    // Update detalle data
    await this.detalleVentaRepository.update(id, updateData);
    return await this.findById(id);
  }

  // Find detalle by id with relations
  async findById(id: number): Promise<detalleVentaEntity> {
    const detalle = await this.detalleVentaRepository.findOne({
      where: {
        id,
        deleted_at: IsNull()
      },
      relations: ['producto', 'venta'],
    });

    if (!detalle) {
      throw new NotFoundException(`Detalle de venta con id ${id} no encontrado`);
    }

    return detalle;
  }

  // Hard delete single detalle
  async deleteDetalle(id: number): Promise<void> {
    const result = await this.detalleVentaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Detalle de venta con id ${id} no encontrado`);
    }
  }

  // Bulk hard delete detalles
  async bulkDeleteDetalles(ids: number[]): Promise<void> {
    const detalles = await this.detalleVentaRepository.find({
      where: {
        id: In(ids),
        deleted_at: IsNull()
      }
    });

    if (detalles.length !== ids.length) {
      throw new BadRequestException('Algunos detalles no existen');
    }

    await this.detalleVentaRepository.delete(ids);
  }

  // Soft delete
  async softDeleteDetalle(id: number): Promise<void> {
    const result = await this.detalleVentaRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Detalle de venta con id ${id} no encontrado`);
    }
  }

  // Bulk soft delete
  async bulkSoftDeleteDetalles(ids: number[]): Promise<void> {
    const detalles = await this.detalleVentaRepository.find({
      where: {
        id: In(ids),
        deleted_at: IsNull()
      }
    });

    if (detalles.length !== ids.length) {
      throw new BadRequestException('Algunos detalles no existen');
    }

    await this.detalleVentaRepository.softDelete(ids);
  }

  // Restore soft deleted detalle
  async restoreDetalle(id: number): Promise<detalleVentaEntity> {
    const result = await this.detalleVentaRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Detalle de venta con id ${id} no encontrado`);
    }
    return await this.detalleVentaRepository.findOne({ where: { id } });
  }

  // Bulk restore soft deleted detalles
  async bulkRestoreDetalles(ids: number[]): Promise<void> {
    const detalles = await this.detalleVentaRepository.find({
      where: {
        id: In(ids)
      },
      withDeleted: true
    });

    if (detalles.length !== ids.length) {
      throw new BadRequestException('Algunos detalles no existen');
    }

    await this.detalleVentaRepository.restore(ids);
  }

  // Delete all detalles by venta_id
  async deleteDetallesByVenta(ventaId: number): Promise<void> {
    await this.detalleVentaRepository.delete({
      venta: { id: ventaId }
    });
  }

  // Get total cantidad vendida de un producto
  async getCantidadVendidaByProducto(productoId: number): Promise<number> {
    const result = await this.detalleVentaRepository
      .createQueryBuilder('detalle')
      .select('SUM(detalle.cantidad)', 'total')
      .where('detalle.producto.id = :productoId', { productoId })
      .andWhere('detalle.deleted_at IS NULL')
      .getRawOne();

    return parseInt(result?.total || '0');
  }

  // Get total ventas (monto) de un producto
  async getTotalVentasByProducto(productoId: number): Promise<number> {
    const result = await this.detalleVentaRepository
      .createQueryBuilder('detalle')
      .select('SUM(detalle.subtotal)', 'total')
      .where('detalle.producto.id = :productoId', { productoId })
      .andWhere('detalle.deleted_at IS NULL')
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  // Get productos más vendidos
  async getProductosMasVendidos(limit: number = 10): Promise<any[]> {
    return await this.detalleVentaRepository
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
  async getDetallesConCantidadMinima(cantidadMinima: number): Promise<detalleVentaEntity[]> {
    return await this.detalleVentaRepository
      .createQueryBuilder('detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')
      .leftJoinAndSelect('detalle.venta', 'venta')
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
