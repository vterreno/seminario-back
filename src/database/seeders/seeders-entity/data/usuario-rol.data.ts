/**
 * Datos de usuarios y roles para el seeder
 */

export interface UsuarioRolData {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rolNombre: string;
    empresaNombre: string | null; // null para superadmin
    tipoPermisos: 'todos' | 'administrador' | 'lectura';
    descripcion: string;
}

export const usuariosYRoles: UsuarioRolData[] = [
    // Superadmin (sin empresa)
    {
        email: 'superadmin@sistema.com',
        password: 'super123',
        nombre: 'Super',
        apellido: 'Admin',
        rolNombre: 'Superadmin',
        empresaNombre: null,
        tipoPermisos: 'todos',
        descripcion: 'Superadministrador del sistema (acceso total a todas las empresas)'
    },
    
    // Admin de TechCorp
    {
        email: 'admin@techcorp.com',
        password: 'tech123',
        nombre: 'Administrador',
        apellido: 'TechCorp',
        rolNombre: 'Administrador',
        empresaNombre: 'TechCorp S.A.',
        tipoPermisos: 'administrador',
        descripcion: 'Administrador completo de TechCorp'
    },
    
    // Usuario limitado de TechCorp
    {
        email: 'usuario@techcorp.com',
        password: 'user123',
        nombre: 'Usuario',
        apellido: 'TechCorp',
        rolNombre: 'Usuario',
        empresaNombre: 'TechCorp S.A.',
        tipoPermisos: 'lectura',
        descripcion: 'Usuario con permisos de solo lectura en TechCorp'
    },
    
    // Admin de FoodMarket
    {
        email: 'admin@foodmarket.com',
        password: 'food123',
        nombre: 'Administrador',
        apellido: 'FoodMarket',
        rolNombre: 'Administrador',
        empresaNombre: 'FoodMarket Ltda.',
        tipoPermisos: 'administrador',
        descripcion: 'Administrador completo de FoodMarket'
    },
];

// Permisos excluidos para administradores (no pueden gestionar empresas)
export const permisosExcluidosAdmin = [
    'empresa_ver',
    'empresa_agregar',
    'empresa_modificar',
    'empresa_eliminar',
];

// Permisos de solo lectura
export const permisosLectura = [
    'dashboard_ver',
    'usuario_ver',
    'roles_ver',
    'producto_ver',
    'marca_ver',
    'categoria_ver',
    'ventas_ver',
    'compras_ver',
    'cliente_ver',
    'proveedor_ver',
    'sucursal_ver',
    'movimiento_stock_ver',
    'modulo_listas_ver',
];
