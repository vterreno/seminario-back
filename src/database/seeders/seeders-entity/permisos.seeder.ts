import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../../core/permission.entity';

@Injectable()
export class PermisosSeeder {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permisoRepo: Repository<PermissionEntity>,
    ) {}

    async run() {
        const permisos = [
            // Usuario permissions
            { nombre: 'Ver usuario', codigo: 'usuario_ver' },
            { nombre: 'Crear usuario', codigo: 'usuario_agregar' },
            { nombre: 'Modificar usuario', codigo: 'usuario_modificar' },
            { nombre: 'Eliminar usuario', codigo: 'usuario_eliminar' },
            
            // Proveedor permissions
            { nombre: 'Ver proveedor', codigo: 'proveedor_ver' },
            { nombre: 'Crear proveedor', codigo: 'proveedor_agregar' },
            { nombre: 'Modificar proveedor', codigo: 'proveedor_modificar' },
            { nombre: 'Eliminar proveedor', codigo: 'proveedor_eliminar' },
            
            // Cliente permissions
            { nombre: 'Ver cliente', codigo: 'cliente_ver' },
            { nombre: 'Crear cliente', codigo: 'cliente_agregar' },
            { nombre: 'Modificar cliente', codigo: 'cliente_modificar' },
            { nombre: 'Eliminar cliente', codigo: 'cliente_eliminar' },
            
            // Producto permissions
            { nombre: 'Ver producto', codigo: 'producto_ver' },
            { nombre: 'Crear producto', codigo: 'producto_agregar' },
            { nombre: 'Modificar producto', codigo: 'producto_modificar' },
            { nombre: 'Eliminar producto', codigo: 'producto_eliminar' },
            
            // Compras permissions
            { nombre: 'Ver compras', codigo: 'compras_ver' },
            { nombre: 'Crear compra', codigo: 'compras_agregar' },
            { nombre: 'Modificar compra', codigo: 'compras_modificar' },
            { nombre: 'Eliminar compra', codigo: 'compras_eliminar' },
            
            // Ventas permissions
            { nombre: 'Ver ventas', codigo: 'ventas_ver' },
            { nombre: 'Crear venta', codigo: 'ventas_agregar' },
            { nombre: 'Modificar venta', codigo: 'ventas_modificar' },
            { nombre: 'Eliminar venta', codigo: 'ventas_eliminar' },
            { nombre: 'Acceso a caja', codigo: 'ventas_acceso_caja' },
            
            // Marca permissions
            { nombre: 'Ver marca', codigo: 'marca_ver' },
            { nombre: 'Crear marca', codigo: 'marca_agregar' },
            { nombre: 'Modificar marca', codigo: 'marca_modificar' },
            { nombre: 'Eliminar marca', codigo: 'marca_eliminar' },
            
            // Unidad permissions
            { nombre: 'Ver unidad', codigo: 'unidad_ver' },
            { nombre: 'Crear unidad', codigo: 'unidad_agregar' },
            { nombre: 'Modificar unidad', codigo: 'unidad_modificar' },
            { nombre: 'Eliminar unidad', codigo: 'unidad_eliminar' },
            
            // Categoría permissions
            { nombre: 'Ver categoría', codigo: 'categoria_ver' },
            { nombre: 'Crear categoría', codigo: 'categoria_agregar' },
            { nombre: 'Modificar categoría', codigo: 'categoria_modificar' },
            { nombre: 'Eliminar categoría', codigo: 'categoria_eliminar' },
            
            // Empresa permissions
            { nombre: 'Ver empresa', codigo: 'empresa_ver' },
            { nombre: 'Crear empresa', codigo: 'empresa_agregar' },
            { nombre: 'Modificar empresa', codigo: 'empresa_modificar' },
            { nombre: 'Eliminar empresa', codigo: 'empresa_eliminar' },
            
            // Sucursal permissions
            { nombre: 'Ver sucursal', codigo: 'sucursal_ver' },
            { nombre: 'Crear sucursal', codigo: 'sucursal_agregar' },
            { nombre: 'Modificar sucursal', codigo: 'sucursal_modificar' },
            { nombre: 'Eliminar sucursal', codigo: 'sucursal_eliminar' },
            { nombre: 'Acceso a todas las sucursales', codigo: 'sucursal_todas' },
            
            // Configuraciones permissions
            { nombre: 'Configuración de empresa', codigo: 'configuracion_empresa' },
            
            // Listas de precios permissions
            { nombre: 'Lista de precios predeterminada', codigo: 'lista_precios_predeterminada' },
            { nombre: 'Ver listas de precios', codigo: 'lista_precios_ver' },
            { nombre: 'Crear lista de precios', codigo: 'lista_precios_agregar' },
            { nombre: 'Modificar lista de precios', codigo: 'lista_precios_modificar' },
            { nombre: 'Eliminar lista de precios', codigo: 'lista_precios_eliminar' },

            // Role permissions
            { nombre: 'Ver roles', codigo: 'roles_ver' },
            { nombre: 'Crear rol', codigo: 'roles_agregar' },
            { nombre: 'Modificar rol', codigo: 'roles_modificar' },
            { nombre: 'Eliminar rol', codigo: 'roles_eliminar' },

            // Role permissions
            { nombre: 'Ver dashboard', codigo: 'dashboard_ver' },

            // Movimiento stock permissions
            { nombre: 'Ver movimientos de stock', codigo: 'movimiento_stock_ver' },
            { nombre: 'Realizar ajuste de stock', codigo: 'movimiento_stock_ajustar' },
            { nombre: 'Ver historial de movimientos de stock', codigo: 'movimiento_stock_historial' },
        ];

        for (const permiso of permisos) {
            const exists = await this.permisoRepo.findOne({ where: { codigo: permiso.codigo } });
            if (!exists) {
                await this.permisoRepo.save(permiso);
            }
        }
        console.log('Permisos seed completado');
    }
}
