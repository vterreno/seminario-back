import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { MarcaEntity } from 'src/database/core/marcas.entity';
import { BaseService } from 'src/base-service/base-service.service';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoEntity } from 'src/database/core/producto.entity';

@Injectable()
export class MarcasService extends BaseService<MarcaEntity>{
    findManyOptions: FindManyOptions<MarcaEntity> = {};
    findOneOptions: FindOneOptions<MarcaEntity> = {};
    
    constructor(
        @InjectRepository(MarcaEntity) 
        protected marcasRepository: Repository<MarcaEntity>,
        @InjectRepository(ProductoEntity)
        protected productosRepository: Repository<ProductoEntity>
    ){
        super(marcasRepository);
    }
    // Get marcas filtered by company
    async getMarcasByEmpresa(empresaId: number): Promise<MarcaEntity[]> {
        return await this.marcasRepository.find({
            where: { empresa_id: empresaId },
        });
    }

    // Get all marcas (for superadmin)
    async getAllMarcas(): Promise<MarcaEntity[]> {
        return await this.marcasRepository.find({
            relations: ['empresa'],
        });
    }

    // Check if marca name exists (case insensitive)
    async findByNombre(nombre: string, empresaId?: number): Promise<MarcaEntity | null> {
        const query = this.marcasRepository.createQueryBuilder('marca')
            .where('LOWER(marca.nombre) = LOWER(:nombre)', { nombre });
        
        // If empresa is provided, check uniqueness within that empresa
        if (empresaId) {
            query.andWhere('marca.empresa_id = :empresaId', { empresaId });
        }
        
        return await query.getOne();
    }

    // Check if marca name exists for update (exclude current marca, case insensitive)
    async findByNombreForUpdate(nombre: string, currentId: number, empresaId?: number): Promise<MarcaEntity | null> {
        const query = this.marcasRepository.createQueryBuilder('marca')
            .where('LOWER(marca.nombre) = LOWER(:nombre)', { nombre })
            .andWhere('marca.id != :currentId', { currentId });
        
        // If empresa is provided, check uniqueness within that empresa
        if (empresaId) {
            query.andWhere('marca.empresa_id = :empresaId', { empresaId });
        }
        
        return await query.getOne();
    }

    // Create marca
    async createMarca(marcaData: CreateMarcaDto): Promise<MarcaEntity> {
        try {
            const marca = this.marcasRepository.create({
                ...marcaData,
                estado: marcaData.estado ?? true // Default to true if not provided
            });
            
            const savedMarca = await this.marcasRepository.save(marca);            
            return await this.findById(savedMarca.id);
        } catch (error) {
            // Log internal error but don't expose it to client
            console.error('Internal error creating marca:', error);
            throw new BadRequestException('Error al crear la marca. Por favor, verifica los datos e intenta nuevamente.');
        }
    }

    // Update marca
    async updateMarca(id: number, marcaData: UpdateMarcaDto): Promise<MarcaEntity> {
        const marca = await this.findById(id);
        
        if (!marca) {
            throw new BadRequestException(`❌ No se encontró la marca que intentas actualizar. Verifica que el ID sea correcto.`);
        }

        await this.marcasRepository.update(id, marcaData);
        return await this.findById(id);
    }

    // Find marca by id with relations
    async findById(id: number): Promise<MarcaEntity> {
        return await this.marcasRepository.findOne({
            where: { id },
            relations: ['empresa'],
        });
    }

    // Delete single marca
    async deleteMarca(id: number): Promise<void> {
        // 1️⃣ Verificar si la marca existe
        const marca = await this.marcasRepository.findOne({ where: { id } });
        if (!marca) {
            throw new BadRequestException(`La marca con ID ${id} no existe.`);
        }

        // 2️⃣ Verificar si tiene productos asociados
        const productosAsociados = await this.productosRepository.find({
            where: { marca_id: id },
            select: ['id'], // optimiza la consulta
        });

        if (productosAsociados.length > 0) {
            throw new BadRequestException(
                `No se puede eliminar la marca porque tiene ${productosAsociados.length} producto(s) asociados.`
            );
        }

        // 3️⃣ Eliminar si pasa todas las validaciones
        await this.marcasRepository.delete(id);
    }

    // Bulk delete marcas
    async bulkDeleteMarcas(ids: number[], empresaId?: number): Promise<void> {
        // 1️⃣ Validar que las marcas pertenezcan a la empresa
        if (empresaId) {
            const marcas = await this.marcasRepository.find({
                where: { id: In(ids), empresa_id: empresaId }
            });

            if (marcas.length !== ids.length) {
                throw new BadRequestException(
                    'Algunas marcas que intentas eliminar no pertenecen a tu empresa o no existen.'
                );
            }
        }

        // 2️⃣ Verificar si alguna marca tiene productos asociados
        const productosAsociados = await this.productosRepository.find({
            where: { marca_id: In(ids) },
            select: ['marca_id'],
        });

        if (productosAsociados.length > 0) {
            // Obtener las marcas bloqueadas
            const marcasBloqueadas = [...new Set(productosAsociados.map(p => p.marca_id))];
            throw new BadRequestException(
                `No se pueden eliminar las marcas con ID: ${marcasBloqueadas.join(', ')} porque tienen productos asociados.`
            );
        }

        // 3️⃣ Si todo está OK, eliminar las marcas
        await this.marcasRepository.delete(ids);
    }


    // Bulk update marca status (activate/deactivate)
    async bulkUpdateMarcaStatus(ids: number[], estado: boolean, empresaId?: number): Promise<MarcaEntity[]> {
        // If empresa validation is needed, check marcas belong to the company
        if (empresaId) {
            const marcas = await this.marcasRepository.find({
                where: { id: In(ids), empresa_id: empresaId }
            });

            if (marcas.length !== ids.length) {
                throw new BadRequestException('❌ Algunas marcas que intentas modificar no pertenecen a tu empresa o no existen.');
            }
        }

        // Update the marcas
        await this.marcasRepository.update(ids, { estado });

        // Return updated marcas with relations
        return await this.marcasRepository.find({
            where: { id: In(ids) },
            relations: ['empresa']
        });
    }

    // Soft delete (set estado to false instead of hard delete)
    async softDeleteMarca(id: number): Promise<MarcaEntity> {
        await this.marcasRepository.update(id, { estado: false });
        return await this.findById(id);
    }

    // Bulk soft delete
    async bulkSoftDeleteMarcas(ids: number[]): Promise<void> {
        await this.marcasRepository.update(ids, { estado: false });
    }
    
}
