import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { pagoEntity } from 'src/database/core/pago.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { FindManyOptions, FindOneOptions, IsNull, Repository, In } from 'typeorm';

@Injectable()
export class PagoService extends BaseService<pagoEntity> {
  findManyOptions: FindManyOptions<pagoEntity> = {};
  findOneOptions: FindOneOptions<pagoEntity> = {
    relations: ['sucursal', 'venta'],
  };

  constructor(
    @InjectRepository(pagoEntity)
    protected pagoRepository: Repository<pagoEntity>,
    @InjectRepository(sucursalEntity)
    private sucursalRepository: Repository<sucursalEntity>,
  ) {
    super(pagoRepository);
  }

  // Get pagos filtered by sucursal
  async getPagosBySucursal(sucursalId: number): Promise<pagoEntity[]> {
    return await this.pagoRepository.find({
      where: {
        sucursal: { id: sucursalId },
        deleted_at: IsNull()
      },
      relations: ['sucursal', 'venta'],
    });
  }

  // Get all pagos (for superadmin)
  async getAllPagos(): Promise<pagoEntity[]> {
    return await this.pagoRepository.find({
      relations: ['sucursal', 'venta'],
      where: {
        deleted_at: IsNull()
      }
    });
  }

  // Create pago
  async createPago(pagoData: Partial<pagoEntity>): Promise<pagoEntity> {
    const pago = this.pagoRepository.create(pagoData);
    const savedPago = await this.pagoRepository.save(pago);
    return await this.findById(savedPago.id);
  }

  // Update pago
  async updatePago(id: number, pagoData: Partial<pagoEntity>): Promise<pagoEntity> {
    // Check if pago exists
    const pago = await this.findById(id);
    if (!pago) {
      throw new NotFoundException(`Pago con id ${id} no encontrado`);
    }

    // Filtrar propiedades no pertenecientes a la entidad (como isEdit)
    const { isEdit, ...pagoDataFiltered } = pagoData as any;

    // Update pago data
    await this.pagoRepository.update(id, pagoDataFiltered);
    return await this.findById(id);
  }

  // Find pago by id with relations
  async findById(id: number): Promise<pagoEntity> {
    const pago = await this.pagoRepository.findOne({
      where: {
        id,
        deleted_at: IsNull()
      },
      relations: ['sucursal', 'venta'],
    });

    if (!pago) {
      throw new NotFoundException(`Pago con id ${id} no encontrado`);
    }

    return pago;
  }

  // Get sucursal by id
  async getSucursalById(id: number): Promise<sucursalEntity> {
    const sucursal = await this.sucursalRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['empresa'],
    });

    if (!sucursal) {
      throw new NotFoundException(`Sucursal con id ${id} no encontrada`);
    }

    return sucursal;
  }

  // Hard delete single pago
  async deletePago(id: number): Promise<void> {
    const result = await this.pagoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Pago con id ${id} no encontrado`);
    }
  }

  // Bulk hard delete pagos
  async bulkDeletePagos(ids: number[], sucursalId?: number): Promise<void> {
    // If sucursal validation is needed, check pagos belong to the sucursal
    if (sucursalId) {
      const pagos = await this.pagoRepository.find({
        where: {
          id: In(ids),
          sucursal: { id: sucursalId },
          deleted_at: IsNull()
        }
      });

      if (pagos.length !== ids.length) {
        throw new BadRequestException('Algunos pagos no pertenecen a tu sucursal o no existen');
      }
    }

    await this.pagoRepository.delete(ids);
  }

  // Soft delete (using TypeORM's built-in soft delete)
  async softDeletePago(id: number): Promise<void> {
    const result = await this.pagoRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Pago con id ${id} no encontrado`);
    }
  }

  // Bulk soft delete
  async bulkSoftDeletePagos(ids: number[], sucursalId?: number): Promise<void> {
    // If sucursal validation is needed, check pagos belong to the sucursal
    if (sucursalId) {
      const pagos = await this.pagoRepository.find({
        where: {
          id: In(ids),
          sucursal: { id: sucursalId },
          deleted_at: IsNull()
        }
      });

      if (pagos.length !== ids.length) {
        throw new BadRequestException('Algunos pagos no pertenecen a tu sucursal o no existen');
      }
    }

    await this.pagoRepository.softDelete(ids);
  }

  // Restore soft deleted pagos
  async restorePago(id: number): Promise<pagoEntity> {
    const result = await this.pagoRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Pago con id ${id} no encontrado`);
    }
    return await this.pagoRepository.findOne({ where: { id } });
  }

  // Bulk restore soft deleted pagos
  async bulkRestorePagos(ids: number[], sucursalId?: number): Promise<void> {
    // If sucursal validation is needed, check pagos belong to the sucursal
    if (sucursalId) {
      const pagos = await this.pagoRepository.find({
        where: {
          id: In(ids),
          sucursal: { id: sucursalId }
        },
        withDeleted: true
      });

      if (pagos.length !== ids.length) {
        throw new BadRequestException('Algunos pagos no pertenecen a tu sucursal o no existen');
      }
    }

    await this.pagoRepository.restore(ids);
  }

  // Get pagos by metodo_pago
  async getPagosByMetodo(metodo: 'efectivo' | 'transferencia', sucursalId?: number): Promise<pagoEntity[]> {
    const where: any = {
      metodo_pago: metodo,
      deleted_at: IsNull()
    };

    if (sucursalId) {
      where.sucursal = { id: sucursalId };
    }

    return await this.pagoRepository.find({
      where,
      relations: ['sucursal', 'venta'],
    });
  }

  // Get pagos by date range
  async getPagosByDateRange(
    fechaInicio: Date,
    fechaFin: Date,
    sucursalId?: number
  ): Promise<pagoEntity[]> {
    const query = this.pagoRepository.createQueryBuilder('pago')
      .leftJoinAndSelect('pago.sucursal', 'sucursal')
      .leftJoinAndSelect('pago.venta', 'venta')
      .where('pago.fecha_pago BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
      .andWhere('pago.deleted_at IS NULL');

    if (sucursalId) {
      query.andWhere('pago.sucursal.id = :sucursalId', { sucursalId });
    }

    return await query.getMany();
  }

  // Get total monto by sucursal
  async getTotalMontoBySucursal(sucursalId: number): Promise<number> {
    const result = await this.pagoRepository
      .createQueryBuilder('pago')
      .select('SUM(pago.monto_pago)', 'total')
      .where('pago.sucursal.id = :sucursalId', { sucursalId })
      .andWhere('pago.deleted_at IS NULL')
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  // Get total monto by metodo_pago
  async getTotalMontoByMetodo(
    metodo: 'efectivo' | 'transferencia',
    sucursalId?: number
  ): Promise<number> {
    const query = this.pagoRepository
      .createQueryBuilder('pago')
      .select('SUM(pago.monto_pago)', 'total')
      .where('pago.metodo_pago = :metodo', { metodo })
      .andWhere('pago.deleted_at IS NULL');

    if (sucursalId) {
      query.andWhere('pago.sucursal.id = :sucursalId', { sucursalId });
    }

    const result = await query.getRawOne();
    return parseFloat(result?.total || '0');
  }
}
