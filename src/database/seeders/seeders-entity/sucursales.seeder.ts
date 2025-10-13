import { DataSource, Repository } from 'typeorm';
import { sucursalEntity } from '../../core/sucursal.entity';
import { InjectRepository } from '@nestjs/typeorm';

export default class SucursalesSeeder {
    constructor(
        @InjectRepository(sucursalEntity)
        private readonly sucursalRepo: Repository<sucursalEntity>,
    ) {}
    async run(): Promise<any> {
        const repository = this.sucursalRepo;

        // Check if sucursales already exist
        const existingSucursales = await repository.find();
        if (existingSucursales.length > 0) {
            console.log('Sucursales already exist, skipping seeder');
            return;
        }

        const sucursales = [
            {
                nombre: 'Sucursal Central',
                codigo: 'SUC001',
                direccion: 'Av. Principal 123, Ciudad Central',
                estado: true,
                empresa_id: 1,
                numero_venta: 1,
            },
            {
                nombre: 'Sucursal Norte',
                codigo: 'SUC002',
                direccion: 'Calle Norte 456, Zona Norte',
                estado: true,
                empresa_id: 1,
                numero_venta: 1,
            },
            {
                nombre: 'Sucursal Sur',
                codigo: 'SUC003',
                direccion: 'Av. Sur 789, Zona Sur',
                estado: true,
                empresa_id: 1,
                numero_venta: 1,
            },
            {
                nombre: 'Sucursal Este',
                codigo: 'SUC004',
                direccion: 'Boulevard Este 321, Zona Este',
                estado: false,
                empresa_id: 1,
                numero_venta: 1,
            },
            {
                nombre: 'Sucursal Oeste',
                codigo: 'SUC005',
                direccion: 'Calle Oeste 654, Zona Oeste',
                estado: true,
                empresa_id: 2,
                numero_venta: 1,
            },
        ];

        await repository.save(sucursales);
        console.log('Sucursales seeded successfully');
    }
}
