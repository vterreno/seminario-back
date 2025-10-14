import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { BaseService } from 'src/base-service/base-service.service';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { MarcaEntity } from 'src/database/core/marcas.entity';
import { In } from 'typeorm/find-options/operator/In';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';

@Injectable()
export class ProductosService extends BaseService<ProductoEntity>{
    findManyOptions: FindManyOptions<ProductoEntity> = {};
    findOneOptions: FindOneOptions<ProductoEntity> = {};
    
    constructor(
        @InjectRepository(ProductoEntity) 
        protected productosRepository: Repository<ProductoEntity>,
        @InjectRepository(MovimientoStockEntity)
        protected movimientoStockRepository: Repository<MovimientoStockEntity>,
        @InjectRepository(sucursalEntity)
        protected sucursalRepository: Repository<sucursalEntity>
    ){
        super(productosRepository);
    }

    // Get productos by sucursal
    async getProductosBySucursal(sucursalId: number): Promise<ProductoEntity[]> {
        return await this.productosRepository.find({
            where: { sucursal_id: sucursalId },
            relations: ['sucursal', 'sucursal.empresa', 'marca'],
        });
    }

    // Get productos filtered by company (all productos from all sucursales of the company)
    async getProductosByEmpresa(empresaId: number): Promise<ProductoEntity[]> {
        return await this.productosRepository
            .createQueryBuilder('producto')
            .leftJoinAndSelect('producto.sucursal', 'sucursal')
            .leftJoinAndSelect('sucursal.empresa', 'empresa')
            .leftJoinAndSelect('producto.marca', 'marca')
            .where('sucursal.empresa_id = :empresaId', { empresaId })
            .getMany();
    }

    // Get all productos (for superadmin)
    async getAllProductos(): Promise<ProductoEntity[]> {
        return await this.productosRepository.find({
            relations: ['sucursal', 'sucursal.empresa', 'marca'],
        });
    }

    // Check if producto codigo exists (case insensitive)
    async findByCodigo(codigo: string, sucursalId?: number): Promise<ProductoEntity | null> {
        const query = this.productosRepository.createQueryBuilder('producto')
            .where('LOWER(producto.codigo) = LOWER(:codigo)', { codigo });

        // If sucursal is provided, check uniqueness within that sucursal
        if (sucursalId) {
            query.andWhere('producto.sucursal_id = :sucursalId', { sucursalId });
        }
        
        return await query.getOne();
    }

    // Validate that sucursal belongs to empresa
    async validateSucursalBelongsToEmpresa(sucursalId: number, empresaId: number): Promise<void> {
        const sucursal = await this.sucursalRepository.findOne({
            where: { id: sucursalId, empresa_id: empresaId }
        });

        if (!sucursal) {
            throw new BadRequestException('La sucursal seleccionada no pertenece a tu empresa o no existe.');
        }
    }

    // Validate that producto belongs to empresa (through sucursal)
    async validateProductoBelongsToEmpresa(producto: ProductoEntity, empresaId: number): Promise<void> {
        const productoWithSucursal = await this.productosRepository.findOne({
            where: { id: producto.id },
            relations: ['sucursal']
        });

        if (!productoWithSucursal?.sucursal || productoWithSucursal.sucursal.empresa_id !== empresaId) {
            throw new BadRequestException('No tienes permisos para acceder a este producto.');
        }
    }

    // Create producto
    async createProducto(productoData: CreateProductoDto): Promise<ProductoEntity> {
        try {
            // Obtener la sucursal para poder acceder a empresa_id para el movimiento
            const sucursal = await this.sucursalRepository.findOne({
                where: { id: productoData.sucursal_id },
                relations: ['empresa']
            });

            if (!sucursal) {
                throw new BadRequestException('La sucursal especificada no existe.');
            }

            const producto = this.productosRepository.create({
                ...productoData,
                estado: productoData.estado ?? true, // Default to true if not provided
                stock: productoData.stock_apertura ?? 0, // Convertir stock_apertura en stock actual
                stock_apertura: productoData.stock_apertura ?? 0 // Mantener el valor original de stock_apertura
            });
            const savedProducto = await this.productosRepository.save(producto);

            const movimiento = this.movimientoStockRepository.create({
                fecha: new Date(),
                tipo_movimiento: TipoMovimientoStock.STOCK_APERTURA,
                descripcion: 'Stock de apertura al crear producto',
                cantidad: productoData.stock_apertura ?? 0,
                stock_resultante: productoData.stock_apertura ?? 0,
                producto_id: producto.id,
                sucursal_id: sucursal.id
            });
            await this.movimientoStockRepository.save(movimiento);
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
            relations: ['sucursal', 'sucursal.empresa', 'marca'],
        });
    }

    // Delete single producto
    async deleteProducto(id: number): Promise<void> {
        await this.productosRepository.delete(id);
    }

    // Bulk delete productos
    async bulkDeleteProductos(ids: number[], empresaId?: number): Promise<void> {
        // If empresa validation is needed, check productos belong to sucursales of the company
        if (empresaId) {
            const productos = await this.productosRepository
                .createQueryBuilder('producto')
                .leftJoin('producto.sucursal', 'sucursal')
                .where('producto.id IN (:...ids)', { ids })
                .andWhere('sucursal.empresa_id = :empresaId', { empresaId })
                .getMany();

            if (productos.length !== ids.length) {
                throw new BadRequestException('❌ Algunos productos que intentas eliminar no pertenecen a tu empresa o no existen.');
            }
        }

        await this.productosRepository.delete(ids);
    }

    // Bulk update producto status (activate/deactivate)
    async bulkUpdateProductoStatus(ids: number[], estado: boolean, empresaId?: number): Promise<ProductoEntity[]> {
        // If empresa validation is needed, check productos belong to sucursales of the company
        if (empresaId) {
            const productos = await this.productosRepository
                .createQueryBuilder('producto')
                .leftJoin('producto.sucursal', 'sucursal')
                .where('producto.id IN (:...ids)', { ids })
                .andWhere('sucursal.empresa_id = :empresaId', { empresaId })
                .getMany();

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
            relations: ['sucursal', 'sucursal.empresa']
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

    async getStockProducto(id: number, sucursalId?: number): Promise<number> {
        const whereCondition: any = { id };
        if (sucursalId) {
            whereCondition.sucursal_id = sucursalId;
        }

        const productos = await this.productosRepository.findOne({
            where: whereCondition
        });
        
        if (!productos) {
            throw new BadRequestException(`No se encontró el producto. Verifica que el ID sea correcto.`);
        }
        return productos.stock;
    }

}
