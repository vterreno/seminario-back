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

  /**
   * Verifica si una unidad de medida está siendo utilizada por productos
   * TODO: Reemplazar simulación con consulta real a tabla de productos
   * @param abreviatura - Abreviatura de la unidad de medida
   * @returns boolean indicando si está en uso
   */
  private isUnitInUse(abreviatura: string): boolean {
    // TODO: Implementar consulta real a tabla productos cuando esté disponible
    // SELECT COUNT(*) FROM productos WHERE unidad_medida_abreviatura = ? AND empresa_id = ?
    
    // Por ahora permitir eliminar todas las unidades
    return false;
  }

  async findAll(empresaId?: number): Promise<UnidadMedida[]> {
    // Si no hay empresaId (como en el caso de superadmin), devolver todas las unidades
    if (!empresaId) {
      return this.unidadMedidaRepository.find({
        relations: ['empresa'],
        order: { nombre: 'ASC' },
      });
    }
    
    return this.unidadMedidaRepository.find({
      where: { empresaId },
      relations: ['empresa'], // Incluir también para usuarios normales
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number, empresaId: number): Promise<UnidadMedida> {
    const unidad = await this.unidadMedidaRepository.findOne({
      where: { id, empresaId },
    });

    if (!unidad) {
      throw new NotFoundException(`No se encontró la unidad de medida con ID ${id} para su empresa. Verifique que el ID sea correcto y que la unidad pertenezca a su empresa.`);
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
        throw new ConflictException(`No se puede crear la unidad de medida "${createDto.nombre}" porque ya existe una unidad con ese nombre. La unidad existente tiene la abreviatura "${existing.abreviatura}".`);
      }
      if (existing.abreviatura === createDto.abreviatura) {
        throw new ConflictException(`No se puede crear la unidad de medida con abreviatura "${createDto.abreviatura}" porque ya existe una unidad llamada "${existing.nombre}" con esa abreviatura. Por favor, use una abreviatura diferente.`);
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
          throw new ConflictException(`No se puede actualizar la unidad de medida con el nombre "${updateDto.nombre}" porque ya existe otra unidad con ese nombre. La unidad existente tiene la abreviatura "${existing.abreviatura}".`);
        }
        if (existing.abreviatura === updateDto.abreviatura) {
          throw new ConflictException(`No se puede actualizar la unidad de medida con la abreviatura "${updateDto.abreviatura}" porque ya existe otra unidad llamada "${existing.nombre}" con esa abreviatura. Por favor, use una abreviatura diferente.`);
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
    
    if (this.isUnitInUse(unidad.abreviatura)) {
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
        throw new NotFoundException('No se proporcionaron unidades de medida para eliminar. Seleccione al menos una unidad de medida.');
      }

      const unidades = await this.unidadMedidaRepository.find({
        where: { empresaId },
        select: ['id']
      });

      const validIds = unidades.map(u => u.id);
      const idsToDelete = ids.filter(id => validIds.includes(id));

      if (idsToDelete.length === 0) {
        throw new NotFoundException('Las unidades de medida seleccionadas no existen o no pertenecen a su empresa. Verifique las unidades seleccionadas e intente nuevamente.');
      }

      // Verificar cuáles unidades se pueden eliminar
      const unidadesCompletas = await this.unidadMedidaRepository.find({
        where: { id: In(idsToDelete), empresaId },
      });

      const unidadesNoEliminables = unidadesCompletas.filter(u => 
        this.isUnitInUse(u.abreviatura)
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