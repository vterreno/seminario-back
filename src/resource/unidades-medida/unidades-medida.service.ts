import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
    
    // Verificar si la unidad está siendo utilizada por productos
    const canDeleteResult = await this.canDelete(id, empresaId);
    
    if (!canDeleteResult.canDelete) {
      throw new ConflictException(canDeleteResult.message || 'No se puede eliminar la unidad de medida porque está en uso');
    }
    
    await this.unidadMedidaRepository.remove(unidad);
  }

  async canDelete(id: number, empresaId: number): Promise<{ canDelete: boolean; message?: string }> {
    const unidad = await this.findOne(id, empresaId);
    
    // Simulación: Verificar si la unidad está siendo utilizada por productos
    // En un escenario real, esto consultaría la tabla de productos
    // Para efectos de demostración, vamos a simular que ciertas unidades están en uso
    
    const unidadesEnUso = ['kg', 'unid', 'lts', 'm']; // Simulamos que estas abreviaturas están en uso
    
    if (unidadesEnUso.includes(unidad.abreviatura.toLowerCase())) {
      return {
        canDelete: false,
        message: `No se puede eliminar la unidad de medida "${unidad.nombre}" porque está siendo utilizada por uno o más productos de la empresa.`
      };
    }
    
    return { canDelete: true };
  }

  async bulkDelete(ids: number[], empresaId: number): Promise<{ message?: string }> {
    try {
      if (!ids || ids.length === 0) {
        throw new NotFoundException('No se proporcionaron IDs para eliminar');
      }

      const unidades = await this.unidadMedidaRepository.find({
        where: { empresaId },
        select: ['id']
      });

      const validIds = unidades.map(u => u.id);
      const idsToDelete = ids.filter(id => validIds.includes(id));

      if (idsToDelete.length === 0) {
        throw new NotFoundException('No se encontraron unidades de medida válidas para eliminar');
      }

      // Verificar cuáles unidades se pueden eliminar
      const unidadesCompletas = await this.unidadMedidaRepository.find({
        where: { id: In(idsToDelete), empresaId },
      });

      const unidadesEnUso = ['kg', 'unid', 'lts', 'm']; // Simulamos que estas están en uso
      const unidadesNoEliminables = unidadesCompletas.filter(u => 
        unidadesEnUso.includes(u.abreviatura.toLowerCase())
      );

      if (unidadesNoEliminables.length > 0) {
        const nombresEnUso = unidadesNoEliminables.map(u => u.nombre).join(', ');
        throw new ConflictException(
          `No se pueden eliminar las siguientes unidades de medida porque están siendo utilizadas por productos: ${nombresEnUso}`
        );
      }

      await this.unidadMedidaRepository.delete({
        id: In(idsToDelete),
        empresaId
      });

      return { message: `${idsToDelete.length} unidades de medida eliminadas exitosamente` };
    } catch (error) {
      console.error('Error in bulkDelete:', error);
      throw error;
    }
  }
}