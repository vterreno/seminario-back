import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOneOptions, FindManyOptions } from 'typeorm';
import { UnidadMedidaEntity } from '../../database/core/unidad-medida.entity';
import { CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from './dto/unidad-medida.dto';
import { BaseService } from 'src/base-service/base-service.service';
import { ProductoEntity } from 'src/database/core/producto.entity';

@Injectable()
export class UnidadesMedidaService extends BaseService<UnidadMedidaEntity>{
    findManyOptions: FindManyOptions<UnidadMedidaEntity> = {};
    findOneOptions: FindOneOptions<UnidadMedidaEntity> = {};
    
    constructor(
        @InjectRepository(UnidadMedidaEntity) 
        protected unidadesMedidaRepository: Repository<UnidadMedidaEntity>,
        @InjectRepository(ProductoEntity)
        protected productosRepository: Repository<ProductoEntity>,
    ){
        super(unidadesMedidaRepository);
    }
    // Get unidades filtered by sucursal
    async getUnidadesByEmpresa(empresaId: number): Promise<UnidadMedidaEntity[]> {
        return await this.unidadesMedidaRepository.find({
            where: { empresa_id: empresaId },
            relations: ['empresa'],
        });
    }

    // Get all unidades (for superadmin)
    async getAllUnidades(): Promise<UnidadMedidaEntity[]> {
        return await this.unidadesMedidaRepository.find({
            relations: ['empresa'],
        });
    }

    // Create unidad
    async createUnidad(unidadData: CreateUnidadMedidaDto): Promise<UnidadMedidaEntity> {
        try {
            const unidad = this.unidadesMedidaRepository.create({
                ...unidadData,
                estado: unidadData.estado ?? true, // Default to true if not provided
            });
            return await this.unidadesMedidaRepository.save(unidad);
        } catch (error) {
            // Log internal error but don't expose it to client
            console.error('Internal error creating unidad:', error);
            throw new BadRequestException('Error al crear la unidad. Por favor, verifica los datos e intenta nuevamente.');
        }
    }
    // Update unidad
    async updateUnidad(id: number, unidadData: UpdateUnidadMedidaDto): Promise<UnidadMedidaEntity> {
        const unidad = await this.findById(id);

        if (!unidad) {
            throw new BadRequestException(`❌ No se encontró la unidad que intentas actualizar. Verifica que el ID sea correcto.`);
        }
        const existenProductos = await this.productosRepository.find({
            where: { unidad_medida_id: id }
        });
        // Si hay productos asociados, no permitir cambiar nombre, abreviatura o empresa
        if (existenProductos.length > 0) {
            const nombresProductos = existenProductos.map(p => `"${p.nombre}"`).join(', ');
            throw new BadRequestException(`No se puede modificar la unidad "${unidad.nombre}" porque tiene productos asociados: ${nombresProductos}. Primero debe reasignar o eliminar esos productos.`);
        }
        // Validar que no se pueda cambiar la empresa si hay productos asociados
        if (unidadData.empresaId && unidadData.empresaId !== unidad.empresa_id) {
            throw new BadRequestException(`❌ No se puede cambiar la empresa de la unidad "${unidad.nombre}" porque tiene productos asociados. Primero debe reasignar o eliminar esos productos.`);
        }
        // Validar que no se pueda cambiar la abreviatura si hay productos asociados
        if (unidadData.abreviatura && unidadData.abreviatura !== unidad.abreviatura) {
            throw new BadRequestException(`❌ No se puede cambiar la abreviatura de la unidad "${unidad.nombre}" porque tiene productos asociados. Primero debe reasignar o eliminar esos productos.`);
        }

        await this.unidadesMedidaRepository.update(id, unidadData);
        return await this.findById(id);
    }

    // Find unidad by id with relations
    async findById(id: number): Promise<UnidadMedidaEntity> {
        return await this.unidadesMedidaRepository.findOne({
            where: { id },
            relations: ['empresa'],
        });
    }

    async deleteUnidad(id: number): Promise<void> {
        const existenProductos = await this.productosRepository.find({
            where: { unidad_medida_id: id }
        });
        if (existenProductos.length > 0) {
            const nombresProductos = existenProductos.map(p => `"${p.nombre}"`).join(', ');
            throw new BadRequestException(`No se puede eliminar la unidad porque está asociada a los siguientes productos: ${nombresProductos}. Primero debe reasignar o eliminar esos productos.`);
        }

        await this.unidadesMedidaRepository.delete(id);
    }

    // Bulk delete unidades
    async bulkDeleteUnidades(ids: number[], empresaId?: number): Promise<void> {
        // If sucursal validation is needed, check unidades belong to the sucursal
        if (empresaId) {
            const unidades = await this.unidadesMedidaRepository.find({
                where: { id: In(ids), empresa_id: empresaId }
            });

            if (unidades.length !== ids.length) {
                throw new BadRequestException('❌ Algunas unidades que intentas eliminar no pertenecen a tu empresa o no existen.');
            }
        }

        await this.unidadesMedidaRepository.delete(ids);
    }

    // Bulk update unidad status (activate/deactivate)
    async bulkUpdateUnidadStatus(ids: number[], estado: boolean, empresaId?: number): Promise<UnidadMedidaEntity[]> {
        // If sucursal validation is needed, check unidades belong to the sucursal
        if (empresaId) {
            const unidades = await this.unidadesMedidaRepository.find({
                where: { id: In(ids), empresa_id: empresaId }
            });

            if (unidades.length !== ids.length) {
                throw new BadRequestException('❌ Algunas unidades que intentas modificar no pertenecen a tu empresa o no existen.');
            }
        }
        // Si se intenta inactivar unidades, validar que no tengan stock > 0
        if (estado === false) {
            const existenProductos = await this.productosRepository.find({
                where: { unidad_medida_id: In(ids) }
            });
            if (existenProductos.length > 0) {
                const nombresUnidades = existenProductos.map(p => `"${p.nombre}"`).join(', ');
                throw new BadRequestException(`No se pueden inactivar las siguientes unidades porque están asociadas a productos: ${nombresUnidades}. Primero debe reasignar o eliminar esos productos.`);
            }
        }

        // Update the unidades
        await this.unidadesMedidaRepository.update(ids, { estado });

        // Return updated unidades with relations
        return await this.unidadesMedidaRepository.find({
            where: { id: In(ids) },
            relations: ['empresa']
        });
    }

    // Soft delete (set estado to false instead of hard delete)
    async softDeleteUnidad(id: number): Promise<UnidadMedidaEntity> {
        await this.unidadesMedidaRepository.update(id, { estado: false });
        return await this.findById(id);
    }

    // Bulk soft delete
    async bulkSoftDeleteUnidades(ids: number[]): Promise<void> {
        await this.unidadesMedidaRepository.update(ids, { estado: false });
    }

}