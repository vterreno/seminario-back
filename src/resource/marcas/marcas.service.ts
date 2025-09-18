import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { MarcaEntity } from 'src/database/core/marcas.entity';
import { BaseService } from 'src/base-service/base-service.service';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MarcasService extends BaseService<MarcaEntity>{
    findManyOptions: FindManyOptions<MarcaEntity> = {};
    findOneOptions: FindOneOptions<MarcaEntity> = {};
    
    constructor(
        @InjectRepository(MarcaEntity) 
        protected marcasRepository: Repository<MarcaEntity>
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

    // Check if marca name exists
    async findByNombre(nombre: string, empresaId?: number): Promise<MarcaEntity | null> {
        const whereCondition: any = { nombre }; 
        // If empresa is provided, check uniqueness within that empresa
        if (empresaId) {
            whereCondition.empresa_id = empresaId;
        }        
        const result = await this.marcasRepository.findOne({
            where: whereCondition,
        });
        return result;
    }

    // Check if marca name exists for update (exclude current marca)
    async findByNombreForUpdate(nombre: string, currentId: number, empresaId?: number): Promise<MarcaEntity | null> {
        const query = this.marcasRepository.createQueryBuilder('marca')
            .where('marca.nombre = :nombre', { nombre })
            .andWhere('marca.id != :currentId', { currentId });
        
        // If empresa is provided, check uniqueness within that empresa
        if (empresaId) {
            query.andWhere('marca.empresa_id = :empresaId', { empresaId });
        }
        
        return await query.getOne();
    }

    // Create marca
    async createMarca(marcaData: CreateMarcaDto): Promise<MarcaEntity> {
        // Check if marca name already exists
        const existingMarca = await this.findByNombre(marcaData.nombre, marcaData.empresa_id);            
        if (existingMarca) {
            const errorMessage = marcaData.empresa_id 
                ? `Ya existe una marca llamada "${marcaData.nombre}" en tu empresa. Por favor, elige un nombre diferente.`
                : `Ya existe una marca llamada "${marcaData.nombre}". Por favor, elige un nombre diferente.`;
            throw new BadRequestException(errorMessage);
        }
        
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

        // If name is being updated, check for uniqueness
        if (marcaData.nombre && marcaData.nombre !== marca.nombre) {
            const existingMarca = await this.findByNombreForUpdate(
                marcaData.nombre, 
                id, 
                marcaData.empresa_id || marca.empresa_id
            );
            
            if (existingMarca) {
                if (marca.empresa_id) {
                    throw new BadRequestException(`⚠️ Ya existe otra marca llamada "${marcaData.nombre}" en tu empresa. Por favor, elige un nombre diferente.`);
                } else {
                    throw new BadRequestException(`⚠️ Ya existe otra marca llamada "${marcaData.nombre}". Por favor, elige un nombre diferente.`);
                }
            }
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
        await this.marcasRepository.delete(id);
    }

    // Bulk delete marcas
    async bulkDeleteMarcas(ids: number[], empresaId?: number): Promise<void> {
        // If empresa validation is needed, check marcas belong to the company
        if (empresaId) {
            const marcas = await this.marcasRepository.find({
                where: { id: In(ids), empresa_id: empresaId }
            });

            if (marcas.length !== ids.length) {
                throw new BadRequestException('❌ Algunas marcas que intentas eliminar no pertenecen a tu empresa o no existen.');
            }
        }

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
