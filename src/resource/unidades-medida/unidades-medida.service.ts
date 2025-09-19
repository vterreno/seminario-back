import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadMedida } from '../../database/core/unidad-medida.entity';
import { CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from './dto/unidad-medida.dto';

@Injectable()
export class UnidadesMedidaService {
  constructor(
    @InjectRepository(UnidadMedida)
    private readonly unidadMedidaRepository: Repository<UnidadMedida>,
  ) {}

  async findAll(empresaId: number): Promise<UnidadMedida[]> {
    return this.unidadMedidaRepository.find({
      where: { empresaId },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number, empresaId: number): Promise<UnidadMedida> {
    const unidad = await this.unidadMedidaRepository.findOne({
      where: { id, empresaId },
    });

    if (!unidad) {
      throw new NotFoundException('Unidad de medida no encontrada');
    }

    return unidad;
  }

  async create(createDto: CreateUnidadMedidaDto, empresaId: number): Promise<UnidadMedida> {
    // Verificar si ya existe una unidad con el mismo nombre o abreviatura
    const existing = await this.unidadMedidaRepository.findOne({
      where: [
        { nombre: createDto.nombre, empresaId },
        { abreviatura: createDto.abreviatura, empresaId },
      ],
    });

    if (existing) {
      if (existing.nombre === createDto.nombre) {
        throw new ConflictException('Ya existe una unidad de medida con ese nombre');
      }
      if (existing.abreviatura === createDto.abreviatura) {
        throw new ConflictException('Ya existe una unidad de medida con esa abreviatura');
      }
    }

    const unidad = this.unidadMedidaRepository.create({
      ...createDto,
      empresaId,
    });

    return this.unidadMedidaRepository.save(unidad);
  }

  async update(id: number, updateDto: UpdateUnidadMedidaDto, empresaId: number): Promise<UnidadMedida> {
    const unidad = await this.findOne(id, empresaId);

    // Verificar conflictos si se está actualizando nombre o abreviatura
    if (updateDto.nombre || updateDto.abreviatura) {
      const conditions = [];
      if (updateDto.nombre) {
        conditions.push({ nombre: updateDto.nombre, empresaId });
      }
      if (updateDto.abreviatura) {
        conditions.push({ abreviatura: updateDto.abreviatura, empresaId });
      }

      const existing = await this.unidadMedidaRepository.findOne({
        where: conditions,
      });

      if (existing && existing.id !== id) {
        if (existing.nombre === updateDto.nombre) {
          throw new ConflictException('Ya existe una unidad de medida con ese nombre');
        }
        if (existing.abreviatura === updateDto.abreviatura) {
          throw new ConflictException('Ya existe una unidad de medida con esa abreviatura');
        }
      }
    }

    Object.assign(unidad, updateDto);
    return this.unidadMedidaRepository.save(unidad);
  }

  async remove(id: number, empresaId: number): Promise<void> {
    const unidad = await this.findOne(id, empresaId);
    
    // TODO: Verificar si la unidad está siendo utilizada por productos
    // Esta verificación se implementará cuando se tenga la entidad Producto
    
    await this.unidadMedidaRepository.remove(unidad);
  }

  async canDelete(id: number, empresaId: number): Promise<{ canDelete: boolean; message?: string }> {
    const unidad = await this.findOne(id, empresaId);
    
    // TODO: Implementar verificación con productos cuando esté disponible
    // Por ahora, permitir eliminar todas las unidades
    
    return { canDelete: true };
  }
}