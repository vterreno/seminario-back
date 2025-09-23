import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { categoriasEntity } from 'src/database/core/categorias.entity';
import { FindManyOptions, FindOneOptions, Repository, In, IsNull } from 'typeorm';

@Injectable()
export class CategoriasService extends BaseService<categoriasEntity> {
  findManyOptions: FindManyOptions<categoriasEntity> = {};
  findOneOptions: FindOneOptions<categoriasEntity> = {
    relations: ['empresa'],
  }

  constructor(
    @InjectRepository(categoriasEntity)
    protected categoriasRepository: Repository<categoriasEntity>,
  ) {
    super(categoriasRepository);
  }

  // Get categories filtered by company
  async getCategoriasByEmpresa(empresaId: number): Promise<categoriasEntity[]> {
    return await this.categoriasRepository.find({
      where: { 
        empresa_id: empresaId,
        deleted_at: IsNull()
      },
    });
  }

  // Get all categories (for superadmin)
  async getAllCategorias(): Promise<categoriasEntity[]> {
    return await this.categoriasRepository.find({
      relations: ['empresa'],
      where: {
        deleted_at: IsNull()
      }
    });
  }

  // Create category
  async createCategoria(categoriaData: Partial<categoriasEntity>): Promise<categoriasEntity> {
    // Verificar si ya existe una categoría con el mismo nombre en la misma empresa
    if (categoriaData.nombre && categoriaData.empresa_id) {
      const existingCategoria = await this.findByNombre(categoriaData.nombre, categoriaData.empresa_id);
      if (existingCategoria) {
        throw new BadRequestException(`Ya existe una categoría con el nombre "${categoriaData.nombre}" en esta empresa.`);
      }
    }

    const categoria = this.categoriasRepository.create(categoriaData);
    const savedCategoria = await this.categoriasRepository.save(categoria);
    return await this.findById(savedCategoria.id);
  }

  // Update category
  async updateCategoria(id: number, categoriaData: Partial<categoriasEntity>): Promise<categoriasEntity> {
    console.log('Datos de categoría a actualizar:', categoriaData);
    // Check if category exists
    const categoria = await this.findById(id);
    if (!categoria) {
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);
    }
    
    // Verificar si ya existe otra categoría con el mismo nombre en la misma empresa (excluyendo la actual)
    if (categoriaData.nombre && categoria.nombre !== categoriaData.nombre) {
      const existingCategoria = await this.findByNombreForUpdate(
        categoriaData.nombre, 
        id, 
        categoria.empresa_id
      );
      
      if (existingCategoria) {
        throw new BadRequestException(`Ya existe otra categoría con el nombre "${categoriaData.nombre}" en esta empresa.`);
      }
    }
    
    // Filtrar propiedades no pertenecientes a la entidad (como isEdit)
    const { isEdit, ...categoriaDataFiltered } = categoriaData as any;
    console.log('Datos filtrados para actualizar:', categoriaDataFiltered);
    
    // Update basic category data
    await this.categoriasRepository.update(id, categoriaDataFiltered);
    return await this.findById(id);
  }

  // Find category by id with relations
  async findById(id: number): Promise<categoriasEntity> {
    const categoria = await this.categoriasRepository.findOne({
      where: { 
        id,
        deleted_at: IsNull()
      },
      relations: ['empresa'],
    });
    
    if (!categoria) {
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);
    }
    
    return categoria;
  }

  // Hard delete single category
  async deleteCategoria(id: number): Promise<void> {
    const result = await this.categoriasRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);
    }
  }

  // Bulk hard delete categories
  async bulkDeleteCategorias(ids: number[], empresaId?: number): Promise<void> {
    // If empresa validation is needed, check categories belong to the company
    if (empresaId) {
      const categorias = await this.categoriasRepository.find({
        where: { 
          id: In(ids), 
          empresa_id: empresaId,
          deleted_at: IsNull()
        }
      });
      
      if (categorias.length !== ids.length) {
        throw new BadRequestException('Algunas categorías no pertenecen a tu empresa o no existen');
      }
    }

    await this.categoriasRepository.delete(ids);
  }

  // Soft delete (using TypeORM's built-in soft delete)
  async softDeleteCategoria(id: number): Promise<void> {
    const result = await this.categoriasRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);
    }
  }

  // Bulk soft delete
  async bulkSoftDeleteCategorias(ids: number[], empresaId?: number): Promise<void> {
    // If empresa validation is needed, check categories belong to the company
    if (empresaId) {
      const categorias = await this.categoriasRepository.find({
        where: { 
          id: In(ids), 
          empresa_id: empresaId,
          deleted_at: IsNull()
        }
      });
      
      if (categorias.length !== ids.length) {
        throw new BadRequestException('Algunas categorías no pertenecen a tu empresa o no existen');
      }
    }

    await this.categoriasRepository.softDelete(ids);
  }

  // Restore soft deleted categories
  async restoreCategoria(id: number): Promise<categoriasEntity> {
    const result = await this.categoriasRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);
    }
    return await this.categoriasRepository.findOne({ where: { id } });
  }

  // Bulk restore soft deleted categories
  async bulkRestoreCategorias(ids: number[], empresaId?: number): Promise<void> {
    // If empresa validation is needed, check categories belong to the company
    if (empresaId) {
      const categorias = await this.categoriasRepository.find({
        where: { 
          id: In(ids), 
          empresa_id: empresaId
        },
        withDeleted: true
      });
      
      if (categorias.length !== ids.length) {
        throw new BadRequestException('Algunas categorías no pertenecen a tu empresa o no existen');
      }
    }

    await this.categoriasRepository.restore(ids);
  }

  // Bulk update categoria status
  async bulkUpdateCategoriaStatus(
    ids: number[],
    estado: boolean,
    empresaId?: number
  ): Promise<categoriasEntity[]> {
    // If empresa validation is needed, check categorias belong to the company
    if (empresaId) {
      const categorias = await this.categoriasRepository.find({
        where: {
          id: In(ids),
          empresa_id: empresaId,
          deleted_at: IsNull()
        }
      });

      if (categorias.length !== ids.length) {
        throw new BadRequestException('Algunas categorías no pertenecen a tu empresa o no existen');
      }
    }

    // Update status for all categories
    await this.categoriasRepository.update(
      { id: In(ids) },
      { estado }
    );

    // Return updated categories
    return await this.categoriasRepository.find({
      where: { id: In(ids) },
      relations: ['empresa']
    });
  }

  // Check if categoria name exists (case insensitive)
  async findByNombre(nombre: string, empresaId?: number): Promise<categoriasEntity | null> {
  
    const query = this.categoriasRepository.createQueryBuilder('categoria')
      .where('LOWER(categoria.nombre) = LOWER(:nombre)', { nombre });

    // If empresa is provided, check uniqueness within that empresa
    if (empresaId) {
      query.andWhere('categoria.empresa_id = :empresaId', { empresaId });
    }

    return await query.getOne();
  }

  // Check if categoria name exists for update (exclude current categoria, case insensitive)
  async findByNombreForUpdate(nombre: string, currentId: number, empresaId?: number): Promise<categoriasEntity | null> {
    const query = this.categoriasRepository.createQueryBuilder('categoria')
      .where('LOWER(categoria.nombre) = LOWER(:nombre)', { nombre })
      .andWhere('categoria.id != :currentId', { currentId });

    // If empresa is provided, check uniqueness within that empresa
    if (empresaId) {
      query.andWhere('categoria.empresa_id = :empresaId', { empresaId });
    }

    return await query.getOne();
  }
}
