import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateListaPrecioDto } from './dto/create-lista-precio.dto';
import { UpdateListaPrecioDto } from './dto/update-lista-precio.dto';
import { extend } from 'dayjs';
import { BaseService } from 'src/base-service/base-service.service';
import { ListaPreciosEntity } from 'src/database/core/lista-precios.entity';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoListaPreciosEntity } from 'src/database/core/producto-lista-precios.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { RoleEntity } from 'src/database/core/roles.entity';
import { PermissionEntity } from 'src/database/core/permission.entity';
import { PermisosService } from '../permisos/permisos.service';
import { RolesService } from '../roles/roles.service';

type Accion = 'ver' | 'agregar' | 'modificar' | 'eliminar'; 
function generarCodigoPermiso(modulo: string, accion: Accion | string): string {
    // normalizamos todo: pasamos a minusculas y reemplazamos espacios por guines bajos
    const mod = modulo.trim().toLowerCase().replace(/\s+/g, '_');
    const acc = accion.trim().toLowerCase().replace(/\s+/g, '_');
    // agregamos el prefijo "lista_" para evitar conflictos con permisos generales
    return `lista_${mod}_${acc}`;
}
@Injectable()
export class ListaPreciosService extends BaseService<ListaPreciosEntity>{
    findManyOptions: FindManyOptions<ListaPreciosEntity> = {};
    findOneOptions: FindOneOptions<ListaPreciosEntity> = {};

    constructor(
        @InjectRepository(ListaPreciosEntity) 
        protected listaPreciosRepository: Repository<ListaPreciosEntity>,
        @InjectRepository(ProductoListaPreciosEntity)
        protected productoListaPreciosRepository: Repository<ProductoListaPreciosEntity>,
        @InjectRepository(ProductoEntity)
        protected productoRepository: Repository<ProductoEntity>,

        private readonly permisoService: PermisosService,
        private readonly roleService: RolesService,
    ){
        super(listaPreciosRepository);
    }
    // Get lista precios filtered by company
    async getListaPreciosByEmpresa(empresaId: number): Promise<ListaPreciosEntity[]> {
        return await this.listaPreciosRepository.find({
            where: { empresa_id: empresaId },
            relations: ['empresa'],
        });
    }

    // Get all lista precios (for superadmin)
    async getAllListaPrecios(): Promise<ListaPreciosEntity[]> {
        return await this.listaPreciosRepository.find({
            relations: ['empresa'],
        });
    }

    async findByNombre(nombre: string, empresaId?: number): Promise<ListaPreciosEntity | null> {
        const query = this.listaPreciosRepository.createQueryBuilder('lista_precio')
            .where('LOWER(lista_precio.nombre) = LOWER(:nombre)', { nombre });
        // If empresa is provided, check uniqueness within that empresa
        if (empresaId) {
            query.andWhere('lista_precio.empresa_id = :empresaId', { empresaId });
        }
        return await query.getOne();
    }

    // Create lista precio
    async createListaPrecio(listaPrecioData: CreateListaPrecioDto): Promise<any> {
        try {
            const nombre = listaPrecioData.nombre.trim();
            // Verificar si ya existe una lista de precios con el mismo nombre
            const existeListaPrecio = await this.findByNombre(listaPrecioData.nombre, listaPrecioData.empresa_id);
            if (existeListaPrecio) {
                throw new BadRequestException(`Ya existe una lista de precios con el nombre "${listaPrecioData.nombre}" en la empresa seleccionada. Por favor, utiliza un nombre diferente.`);
            }
            const generarPermiso = generarCodigoPermiso(nombre, 'ver');
            const permisoCreado = await this.permisoService.crearPermiso(generarPermiso, `Ver lista de precios ${nombre}`);
            if (!permisoCreado) {
                throw new BadRequestException('Error al crear el permiso asociado a la lista de precios. Por favor, intenta nuevamente.');
            }
            await this.roleService.asignarPermisosArol('Administrador', listaPrecioData.empresa_id, permisoCreado);
            await this.roleService.asignarPermisosArol('Superadmin', null, permisoCreado);
            const { productos, ...listaPrecioInfo } = listaPrecioData;
            // Crear la lista de precios sin productos
            const listaPrecio = this.listaPreciosRepository.create({
                ...listaPrecioInfo,
                estado: listaPrecioData.estado ?? true,
            });
            // Guardar la lista de precios
            const savedListaPrecio = await this.listaPreciosRepository.save(listaPrecio);

            // Si hay productos, crear las relaciones con precios específicos
            if (productos && productos.length > 0) {
                // Verificar que todos los productos existan
                const productoIds = productos.map(p => p.producto_id);
                const existingProductos = await this.productoRepository.find({
                    where: { id: In(productoIds) }
                });
                if (existingProductos.length !== productoIds.length) {
                    throw new BadRequestException('❌ Uno o más productos no existen.');
                }
                // Crear las relaciones en la tabla intermedia
                const productosListasPrecios = productos.map(p => 
                    this.productoListaPreciosRepository.create({
                        lista_precios_id: savedListaPrecio.id,
                        producto_id: p.producto_id,
                        precio_venta_especifico: p.precio_venta_especifico,
                    })
                );
                await this.productoListaPreciosRepository.save(productosListasPrecios);
            }
            // Retornar la lista de precios con el permiso creado
            const listaCompleta = await this.findById(savedListaPrecio.id);
            return {
                ...listaCompleta,
                permisoCreado: {
                    id: permisoCreado.id,
                    codigo: permisoCreado.codigo,
                    nombre: permisoCreado.nombre
                }
            };
        } catch (error) {
            throw new BadRequestException(
                error.message || 'Error al crear la lista precio. Por favor, verifica los datos e intenta nuevamente.',
            );
        }
    }

    // Update lista precio
    async updateListaPrecio(id: number, listaPrecioData: UpdateListaPrecioDto): Promise<ListaPreciosEntity> {
        const listaPrecio = await this.findById(id);

        if (!listaPrecio) {
            throw new BadRequestException(`❌ No se encontró la lista precio que intentas actualizar. Verifica que el ID sea correcto.`);
        }

        // Extraer productos del update
        const { productos, ...rest } = listaPrecioData;

        // Actualizar los datos básicos de la lista (sin productos)
        if (Object.keys(rest).length > 0) {
            await this.listaPreciosRepository.update(id, rest);
        }

        // Si se enviaron productos, actualizar las relaciones
        if (productos && productos.length > 0) {
            // Eliminar relaciones anteriores
            await this.productoListaPreciosRepository.delete({ lista_precios_id: id });

            // Verificar que todos los productos existan
            const productoIds = productos.map(p => p.producto_id);
            const existingProductos = await this.productoRepository.find({
                where: { id: In(productoIds) }
            });

            if (existingProductos.length !== productoIds.length) {
                throw new BadRequestException('❌ Uno o más productos no existen.');
            }

            // Crear las nuevas relaciones en la tabla intermedia
            const productosListasPrecios = productos.map(p => 
                this.productoListaPreciosRepository.create({
                    lista_precios_id: id,
                    producto_id: p.producto_id,
                    precio_venta_especifico: p.precio_venta_especifico,
                })
            );

            await this.productoListaPreciosRepository.save(productosListasPrecios);
        }

        return await this.findById(id);
    }

    // Find lista precio by id with relations
    async findById(id: number): Promise<ListaPreciosEntity> {
        return await this.listaPreciosRepository.findOne({
            where: { id },
            relations: ['empresa', 'productos.marca'],
        });
    }

    // Delete single lista precio
    async deleteListaPrecio(id: number): Promise<void> {
        // Tenemos que eliminar el permiso asociado a esta lista de precios
        const listaPrecio = await this.findById(id);
        if (!listaPrecio) {
            throw new BadRequestException('No se encontró la lista de precios que intentas eliminar.');
        }
        const codigoPermiso = generarCodigoPermiso(listaPrecio.nombre, 'ver');
        const permiso = await this.permisoService.obtenerPermisoPorCodigo(codigoPermiso)
        await this.roleService.eliminarPermisoDeRoles(permiso)
        await this.permisoService.eliminarPermiso(codigoPermiso);
        // Eliminar la lista de precios
        await this.listaPreciosRepository.softDelete(id);
    }

    // Bulk delete lista precios
    async bulkDeleteListaPrecios(ids: number[], empresaId?: number): Promise<void> {
        // If empresa validation is needed, check lista precios belong to the company
        if (empresaId) {
            const listaPrecios = await this.listaPreciosRepository.find({
                where: { id: In(ids), empresa_id: empresaId }
            });

            if (listaPrecios.length !== ids.length) {
                throw new BadRequestException('❌ Algunos lista precios que intentas eliminar no pertenecen a tu empresa o no existen.');
            }
        }

        await this.listaPreciosRepository.delete(ids);
    }

    // Bulk update lista precio status (activate/deactivate)
    async bulkUpdateListaPrecioStatus(ids: number[], estado: boolean, empresaId?: number): Promise<ListaPreciosEntity[]> {
        // If empresa validation is needed, check lista precios belong to the company
        if (empresaId) {
            const listaPrecios = await this.listaPreciosRepository.find({
                where: { id: In(ids), empresa_id: empresaId }
            });

            if (listaPrecios.length !== ids.length) {
                throw new BadRequestException('❌ Algunos lista precios que intentas modificar no pertenecen a tu empresa o no existen.');
            }
        }
        // Update the lista precios
        await this.listaPreciosRepository.update(ids, { estado });
        // Return updated lista precios with relations
        return await this.listaPreciosRepository.find({
            where: { id: In(ids) },
            relations: ['empresa']
        });
    }
    // Soft delete (set estado to false instead of hard delete)
    async softDeleteListaPrecio(id: number): Promise<ListaPreciosEntity> {
        await this.listaPreciosRepository.update(id, { estado: false });
        return await this.findById(id);
    }
    // Bulk soft delete
    async bulkSoftDeleteListaPrecios(ids: number[]): Promise<void> {
        await this.listaPreciosRepository.update(ids, { estado: false });
    }
    async getProductosByListaPrecio(id: number): Promise<any[]> {
        const listaPrecio = await this.listaPreciosRepository.findOne({
            where: { id },
            relations: ['productosListasPrecios', 'productosListasPrecios.producto', 'productosListasPrecios.producto.marca'],
        });
        if (!listaPrecio) {
            throw new BadRequestException(`❌ No se encontró la lista de precios con ID ${id}.`);
        }
        // Mapear productos con sus precios específicos de la tabla intermedia
        return listaPrecio.productosListasPrecios.map(plp => ({
            id: plp.producto.id,
            codigo: plp.producto.codigo,
            nombre: plp.producto.nombre,
            precio_venta: plp.producto.precio_venta || 0, // Precio de venta base del producto
            precio: plp.precio_venta_especifico, // Precio específico de esta lista de precios
            marca: plp.producto.marca ? {
                id: plp.producto.marca.id,
                nombre: plp.producto.marca.nombre,
            } : null,
            categoria: null, // Por implementar cuando se descomente la relación
            unidadMedida: null, // Por implementar cuando se descomente la relación
            estado: plp.producto.estado,
            stock: plp.producto.stock,
        }));
    }
    async updateProductoPrecio(listaId: number, productoId: number, nuevoPrecio: number): Promise<void> {
        // Verificar que la lista de precios existe
        const listaPrecio = await this.listaPreciosRepository.findOne({
            where: { id: listaId },
        });
        if (!listaPrecio) {
            throw new BadRequestException(`❌ No se encontró la lista de precios con ID ${listaId}.`);
        }
        // Verificar que el producto existe
        const producto = await this.productoRepository.findOne({
            where: { id: productoId },
        });
        if (!producto) {
            throw new BadRequestException(`❌ No se encontró el producto con ID ${productoId}.`);
        }
        // Buscar la relación en la tabla intermedia
        const productoListaPrecio = await this.productoListaPreciosRepository.findOne({
            where: { 
                lista_precios_id: listaId,
                producto_id: productoId 
            },
        });
        if (!productoListaPrecio) {
            throw new BadRequestException(`❌ El producto con ID ${productoId} no está asociado a la lista de precios con ID ${listaId}.`);
        }
        // Actualizar el precio específico en la tabla intermedia
        productoListaPrecio.precio_venta_especifico = nuevoPrecio;
        await this.productoListaPreciosRepository.save(productoListaPrecio);
    }

    // Asociar un producto a una lista de precios con un precio específico
    async addProductoToListaPrecio(listaId: number, productoId: number, precioEspecifico: number): Promise<ProductoListaPreciosEntity> {
        // Verificar que la lista de precios existe
        const listaPrecio = await this.listaPreciosRepository.findOne({
            where: { id: listaId },
        });
        if (!listaPrecio) {
            throw new BadRequestException(`❌ No se encontró la lista de precios con ID ${listaId}.`);
        }

        // Verificar que el producto existe
        const producto = await this.productoRepository.findOne({
            where: { id: productoId },
        });

        if (!producto) {
            throw new BadRequestException(`❌ No se encontró el producto con ID ${productoId}.`);
        }

        // Verificar si ya existe la relación
        const existeRelacion = await this.productoListaPreciosRepository.findOne({
            where: { 
                lista_precios_id: listaId,
                producto_id: productoId 
            },
        });

        if (existeRelacion) {
            throw new BadRequestException(`❌ El producto ya está asociado a esta lista de precios. Use el método de actualización para modificar el precio.`);
        }

        // Crear la nueva relación con el precio específico
        const productoListaPrecio = this.productoListaPreciosRepository.create({
            lista_precios_id: listaId,
            producto_id: productoId,
            precio_venta_especifico: precioEspecifico,
        });

        return await this.productoListaPreciosRepository.save(productoListaPrecio);
    }

    // Remover un producto de una lista de precios
    async removeProductoFromListaPrecio(listaId: number, productoId: number): Promise<void> {
        const productoListaPrecio = await this.productoListaPreciosRepository.findOne({
            where: { 
                lista_precios_id: listaId,
                producto_id: productoId 
            },
        });

        if (!productoListaPrecio) {
            throw new BadRequestException(`❌ El producto con ID ${productoId} no está asociado a la lista de precios con ID ${listaId}.`);
        }

        await this.productoListaPreciosRepository.remove(productoListaPrecio);
    }

}
