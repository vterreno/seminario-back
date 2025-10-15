/**
 * Datos de marcas para el seeder
 * Organizadas por empresa
 */

export interface MarcaData {
    nombre: string;
    descripcion: string;
}

export const marcasPorEmpresa: Record<string, MarcaData[]> = {
    'TechCorp S.A.': [
        { nombre: 'Apple', descripcion: 'Dispositivos tecnológicos premium' },
        { nombre: 'Samsung', descripcion: 'Electrónica y smartphones' },
        { nombre: 'Sony', descripcion: 'Electrónica de consumo' },
        { nombre: 'LG', descripcion: 'Electrodomésticos y electrónica' },
        { nombre: 'HP', descripcion: 'Computadoras y equipos de oficina' },
    ],
    'FoodMarket Ltda.': [
        { nombre: 'Coca Cola', descripcion: 'Bebidas refrescantes' },
        { nombre: 'Nestlé', descripcion: 'Productos alimenticios' },
        { nombre: 'Unilever', descripcion: 'Productos de consumo' },
        { nombre: 'Danone', descripcion: 'Lácteos y productos saludables' },
        { nombre: 'Kelloggs', descripcion: 'Cereales y snacks' },
    ],
};
