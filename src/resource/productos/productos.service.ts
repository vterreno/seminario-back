import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { BaseService } from 'src/base-service/base-service.service';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { MarcaEntity } from 'src/database/core/marcas.entity';
import { In } from 'typeorm/find-options/operator/In';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class ProductosService extends BaseService<ProductoEntity>{
    findManyOptions: FindManyOptions<ProductoEntity> = {};
    findOneOptions: FindOneOptions<ProductoEntity> = {};
    
    constructor(
        @InjectRepository(ProductoEntity) 
        protected productosRepository: Repository<ProductoEntity>
    ){
        super(productosRepository);
    }
    // Get productos filtered by company
    async getProductosByEmpresa(empresaId: number): Promise<ProductoEntity[]> {
        return await this.productosRepository.find({
            where: { empresa_id: empresaId },
            relations: ['empresa', 'marca'],
        });
    }

    // Get all productos (for superadmin)
    async getAllProductos(): Promise<ProductoEntity[]> {
        return await this.productosRepository.find({
            relations: ['empresa', 'marca'],
        });
    }

    // Check if producto codigo exists (case insensitive)
    async findByCodigo(codigo: string, empresaId?: number): Promise<ProductoEntity | null> {
        const query = this.productosRepository.createQueryBuilder('producto')
            .where('LOWER(producto.codigo) = LOWER(:codigo)', { codigo });

        // If empresa is provided, check uniqueness within that empresa
        if (empresaId) {
            query.andWhere('producto.empresa_id = :empresaId', { empresaId });
        }
        
        return await query.getOne();
    }

    // Create producto
    async createProducto(productoData: CreateProductoDto): Promise<ProductoEntity> {
        try {
            const producto = this.productosRepository.create({
                ...productoData,
                estado: productoData.estado ?? true, // Default to true if not provided
                stock: productoData.stock_apertura ?? 0, // Convertir stock_apertura en stock actual
                stock_apertura: productoData.stock_apertura ?? 0 // Mantener el valor original de stock_apertura
            });

            const savedProducto = await this.productosRepository.save(producto);
            return await this.findById(savedProducto.id);
        } catch (error) {
            // Log internal error but don't expose it to client
            console.error('Internal error creating producto:', error);
            throw new BadRequestException('Error al crear el producto. Por favor, verifica los datos e intenta nuevamente.');
        }
    }

    // Update producto
    async updateProducto(id: number, productoData: UpdateProductoDto): Promise<ProductoEntity> {
        const producto = await this.findById(id);

        if (!producto) {
            throw new BadRequestException(`❌ No se encontró el producto que intentas actualizar. Verifica que el ID sea correcto.`);
        }

        // Validar que no se pueda inactivar un producto con stock > 0
        if (productoData.estado === false && producto.stock > 0) {
            throw new BadRequestException(`❌ No se puede inactivar el producto "${producto.nombre}" porque tiene stock actual de ${producto.stock} unidades. Primero debe ajustar el stock a cero mediante movimientos de inventario.`);
        }

        await this.productosRepository.update(id, productoData);
        return await this.findById(id);
    }

    // Find producto by id with relations
    async findById(id: number): Promise<ProductoEntity> {
        return await this.productosRepository.findOne({
            where: { id },
            relations: ['empresa', 'marca'],
        });
    }

    // Delete single producto
    async deleteProducto(id: number): Promise<void> {
        await this.productosRepository.delete(id);
    }

    // Bulk delete productos
    async bulkDeleteProductos(ids: number[], empresaId?: number): Promise<void> {
        // If empresa validation is needed, check productos belong to the company
        if (empresaId) {
            const productos = await this.productosRepository.find({
                where: { id: In(ids), empresa_id: empresaId }
            });

            if (productos.length !== ids.length) {
                throw new BadRequestException('❌ Algunos productos que intentas eliminar no pertenecen a tu empresa o no existen.');
            }
        }

        await this.productosRepository.delete(ids);
    }

    // Bulk update producto status (activate/deactivate)
    async bulkUpdateProductoStatus(ids: number[], estado: boolean, empresaId?: number): Promise<ProductoEntity[]> {
        // If empresa validation is needed, check productos belong to the company
        if (empresaId) {
            const productos = await this.productosRepository.find({
                where: { id: In(ids), empresa_id: empresaId }
            });

            if (productos.length !== ids.length) {
                throw new BadRequestException('❌ Algunos productos que intentas modificar no pertenecen a tu empresa o no existen.');
            }
        }

        // Si se intenta inactivar productos, validar que no tengan stock > 0
        if (estado === false) {
            const productosConStockPositivo = await this.productosRepository
                .createQueryBuilder('producto')
                .where('producto.id IN (:...ids)', { ids })
                .andWhere('producto.stock > 0')
                .select(['producto.id', 'producto.nombre', 'producto.stock'])
                .getMany();

            if (productosConStockPositivo.length > 0) {
                const nombresProductos = productosConStockPositivo.map(p => `"${p.nombre}" (Stock: ${p.stock})`).join(', ');
                throw new BadRequestException(`No se pueden inactivar los siguientes productos porque tienen stock mayor a cero: ${nombresProductos}. Primero debe ajustar el stock a cero mediante movimientos de inventario.`);
            }
        }

        // Update the productos
        await this.productosRepository.update(ids, { estado });

        // Return updated productos with relations
        return await this.productosRepository.find({
            where: { id: In(ids) },
            relations: ['empresa']
        });
    }

    // Soft delete (set estado to false instead of hard delete)
    async softDeleteProducto(id: number): Promise<ProductoEntity> {
        await this.productosRepository.update(id, { estado: false });
        return await this.findById(id);
    }

    // Bulk soft delete
    async bulkSoftDeleteProductos(ids: number[]): Promise<void> {
        await this.productosRepository.update(ids, { estado: false });
    }

}
