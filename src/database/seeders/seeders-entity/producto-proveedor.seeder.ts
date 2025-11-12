import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoProveedorEntity } from '../../core/producto-proveedor.entity';
import { ProductoEntity } from '../../core/producto.entity';
import { contactoEntity } from '../../core/contacto.entity';
import { empresaEntity } from '../../core/empresa.entity';

@Injectable()
export class ProductoProveedorSeeder {
    constructor(
        @InjectRepository(ProductoProveedorEntity)
        private readonly productoProveedorRepo: Repository<ProductoProveedorEntity>,
        @InjectRepository(ProductoEntity)
        private readonly productoRepo: Repository<ProductoEntity>,
        @InjectRepository(contactoEntity)
        private readonly contactoRepo: Repository<contactoEntity>,
        @InjectRepository(empresaEntity)
        private readonly empresaRepo: Repository<empresaEntity>,
    ) {}

    async run() {
        console.log('🔗 Iniciando seed de productos por proveedor...');

        // Verificar si ya existen relaciones producto-proveedor
        const existingRelations = await this.productoProveedorRepo.count();
        if (existingRelations > 0) {
            console.log('🔗 Las relaciones producto-proveedor ya existen, saltando seeder');
            return;
        }

        // Obtener empresas
        const empresaTech = await this.empresaRepo.findOne({ where: { name: 'TechCorp S.A.' } });
        const empresaFood = await this.empresaRepo.findOne({ where: { name: 'FoodMarket Ltda.' } });

        if (!empresaTech || !empresaFood) {
            console.log('❌ No se encontraron las empresas');
            return;
        }

        // === PROVEEDORES DE TECHCORP ===
        const proveedoresTech = [
            {
                nombre: 'Tech Solutions S.A.',
                tipo_identificacion: 'CUIT',
                numero_identificacion: '30-71234567-8',
                condicion_iva: 'Responsable Inscripto',
                email: 'ventas@techsolutions.com',
                telefono_movil: '+54 11 4567-8901',
                direccion_calle: 'Av. Córdoba',
                direccion_numero: '1234',
                codigo_postal: '1055',
            },
            {
                nombre: 'Importadora Global Tech',
                tipo_identificacion: 'CUIT',
                numero_identificacion: '30-71234568-9',
                condicion_iva: 'Responsable Inscripto',
                email: 'info@globaltech.com.ar',
                telefono_movil: '+54 11 4567-8902',
                direccion_calle: 'Av. Santa Fe',
                direccion_numero: '2345',
                codigo_postal: '1060',
            },
            {
                nombre: 'Distribuidora TecnoMax',
                tipo_identificacion: 'CUIT',
                numero_identificacion: '30-71234569-0',
                condicion_iva: 'Responsable Inscripto',
                email: 'compras@tecnomaxdist.com',
                telefono_movil: '+54 11 4567-8903',
                direccion_calle: 'Av. Rivadavia',
                direccion_numero: '3456',
                codigo_postal: '1406',
            },
        ];

        // === PROVEEDORES DE FOODMARKET ===
        const proveedoresFood = [
            {
                nombre: 'Distribuidora Alimentaria del Sur',
                tipo_identificacion: 'CUIT',
                numero_identificacion: '30-72234567-8',
                condicion_iva: 'Responsable Inscripto',
                email: 'ventas@alimendelsur.com.ar',
                telefono_movil: '+54 11 5678-9012',
                direccion_calle: 'Av. Juan B. Justo',
                direccion_numero: '4567',
                codigo_postal: '1414',
            },
            {
                nombre: 'Mayorista Central de Alimentos',
                tipo_identificacion: 'CUIT',
                numero_identificacion: '30-72234568-9',
                condicion_iva: 'Responsable Inscripto',
                email: 'info@mayoristacentral.com',
                telefono_movil: '+54 11 5678-9013',
                direccion_calle: 'Av. Corrientes',
                direccion_numero: '5678',
                codigo_postal: '1043',
            },
            {
                nombre: 'Proveedor Express Food',
                tipo_identificacion: 'CUIT',
                numero_identificacion: '30-72234569-0',
                condicion_iva: 'Responsable Inscripto',
                email: 'ventas@expressfood.com.ar',
                telefono_movil: '+54 11 5678-9014',
                direccion_calle: 'Av. Callao',
                direccion_numero: '6789',
                codigo_postal: '1022',
            },
        ];

        // Crear proveedores para TechCorp
        const proveedoresTechCreados = [];
        for (const provData of proveedoresTech) {
            const existingProv = await this.contactoRepo.findOne({
                where: { 
                    nombre_razon_social: provData.nombre,
                    empresa_id: empresaTech.id 
                }
            });

            if (!existingProv) {
                const proveedor = this.contactoRepo.create({
                    nombre_razon_social: provData.nombre,
                    tipo_identificacion: provData.tipo_identificacion as any,
                    numero_identificacion: provData.numero_identificacion,
                    condicion_iva: provData.condicion_iva as any,
                    email: provData.email,
                    telefono_movil: provData.telefono_movil,
                    direccion_calle: provData.direccion_calle,
                    direccion_numero: provData.direccion_numero,
                    codigo_postal: provData.codigo_postal,
                    rol: 'proveedor',
                    estado: true,
                    es_consumidor_final: false,
                    es_empresa: true,
                    empresa_id: empresaTech.id,
                });
                const saved = await this.contactoRepo.save(proveedor);
                proveedoresTechCreados.push(saved);
                console.log(`✅ Proveedor creado: ${provData.nombre} (TechCorp)`);
            } else {
                proveedoresTechCreados.push(existingProv);
                console.log(`ℹ️  Proveedor ya existe: ${provData.nombre}`);
            }
        }

        // Crear proveedores para FoodMarket
        const proveedoresFoodCreados = [];
        for (const provData of proveedoresFood) {
            const existingProv = await this.contactoRepo.findOne({
                where: { 
                    nombre_razon_social: provData.nombre,
                    empresa_id: empresaFood.id 
                }
            });

            if (!existingProv) {
                const proveedor = this.contactoRepo.create({
                    nombre_razon_social: provData.nombre,
                    tipo_identificacion: provData.tipo_identificacion as any,
                    numero_identificacion: provData.numero_identificacion,
                    condicion_iva: provData.condicion_iva as any,
                    email: provData.email,
                    telefono_movil: provData.telefono_movil,
                    direccion_calle: provData.direccion_calle,
                    direccion_numero: provData.direccion_numero,
                    codigo_postal: provData.codigo_postal,
                    rol: 'proveedor',
                    estado: true,
                    es_consumidor_final: false,
                    es_empresa: true,
                    empresa_id: empresaFood.id,
                });
                const saved = await this.contactoRepo.save(proveedor);
                proveedoresFoodCreados.push(saved);
                console.log(`✅ Proveedor creado: ${provData.nombre} (FoodMarket)`);
            } else {
                proveedoresFoodCreados.push(existingProv);
                console.log(`ℹ️  Proveedor ya existe: ${provData.nombre}`);
            }
        }

        // === CREAR RELACIONES PRODUCTO-PROVEEDOR ===

        // Obtener productos de cada empresa
        const productosTech = await this.productoRepo
            .createQueryBuilder('producto')
            .innerJoin('producto.sucursal', 'sucursal')
            .where('sucursal.empresa_id = :empresaId', { empresaId: empresaTech.id })
            .getMany();

        const productosFood = await this.productoRepo
            .createQueryBuilder('producto')
            .innerJoin('producto.sucursal', 'sucursal')
            .where('sucursal.empresa_id = :empresaId', { empresaId: empresaFood.id })
            .getMany();

        console.log(`📦 Productos encontrados - TechCorp: ${productosTech.length}, FoodMarket: ${productosFood.length}`);

        // Asignar productos de TechCorp a proveedores
        let relacionesCreadas = 0;
        for (const producto of productosTech) {
            // Asignar 1-2 proveedores aleatorios por producto
            const numProveedores = Math.floor(Math.random() * 2) + 1;
            const proveedoresSeleccionados = this.shuffleArray([...proveedoresTechCreados]).slice(0, numProveedores);

            for (const proveedor of proveedoresSeleccionados) {
                // Calcular un precio de proveedor (generalmente menor al precio de costo)
                const precioBase = Number(producto.precio_costo);
                const descuento = Math.random() * 0.15 + 0.05; // 5-20% de descuento
                const precioProveedor = Number((precioBase * (1 - descuento)).toFixed(2));

                const productoProveedor = this.productoProveedorRepo.create({
                    producto_id: producto.id,
                    proveedor_id: proveedor.id,
                    precio_proveedor: precioProveedor,
                    codigo_proveedor: `PROV-${proveedor.id}-${producto.codigo}`,
                });

                await this.productoProveedorRepo.save(productoProveedor);
                relacionesCreadas++;
            }
        }

        // Asignar productos de FoodMarket a proveedores
        for (const producto of productosFood) {
            const numProveedores = Math.floor(Math.random() * 2) + 1;
            const proveedoresSeleccionados = this.shuffleArray([...proveedoresFoodCreados]).slice(0, numProveedores);

            for (const proveedor of proveedoresSeleccionados) {
                const precioBase = Number(producto.precio_costo);
                const descuento = Math.random() * 0.15 + 0.05;
                const precioProveedor = Number((precioBase * (1 - descuento)).toFixed(2));

                const productoProveedor = this.productoProveedorRepo.create({
                    producto_id: producto.id,
                    proveedor_id: proveedor.id,
                    precio_proveedor: precioProveedor,
                    codigo_proveedor: `PROV-${proveedor.id}-${producto.codigo}`,
                });

                await this.productoProveedorRepo.save(productoProveedor);
                relacionesCreadas++;
            }
        }

        console.log(`✅ Seed de producto-proveedor completado: ${relacionesCreadas} relaciones creadas`);
    }

    // Utilidad para mezclar arrays
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
