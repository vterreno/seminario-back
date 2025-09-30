import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarcaEntity } from 'src/database/core/marcas.entity';
import { empresaEntity } from 'src/database/core/empresa.entity';

@Injectable()
export class MarcaSeeder {
    constructor(
        @InjectRepository(MarcaEntity)
        private readonly marcaRepo: Repository<MarcaEntity>,
        @InjectRepository(empresaEntity)
        private readonly empresaRepo: Repository<empresaEntity>,
    ) {}

    async run() {
        // Obtener todas las empresas disponibles (activas)
        const empresas = await this.empresaRepo.find({ where: { estado: true } });
        if (empresas.length === 0) {
            console.log('❌ No hay empresas disponibles para crear marcas');
            return;
        }

        // 🔹 Buscar empresas por nombre para asignar marcas correctamente
        const empresaPrueba = empresas.find(e => e.name === 'Empresa Prueba');
        const empresaComercial = empresas.find(e => e.name === 'Empresa MatePymes');
        const empresaPrincipal = empresas.find(e => e.name === 'Empresa Principal');

        const marcasConEmpresa = [
        // Empresa Prueba → bebidas
        ...(empresaPrueba ? [
            { empresaId: 2, nombre: 'Coca Cola', descripcion: 'Bebida gaseosa refrescante' },
            { empresaId: 2, nombre: 'Pepsi', descripcion: 'Bebida gaseosa cola' },
            { empresaId: 2, nombre: 'Sprite', descripcion: 'Bebida gaseosa de limón' },
            { empresaId: 2, nombre: 'Fanta', descripcion: 'Bebida gaseosa de naranja' },
        ] : []),

        // Empresa Comercial → tecnología
        ...(empresaComercial ? [
            { empresaId: 3, nombre: 'Samsung', descripcion: 'Electrónica y smartphones' },
            { empresaId: 3, nombre: 'Apple', descripcion: 'Dispositivos tecnológicos premium' },
            { empresaId: 3, nombre: 'Sony', descripcion: 'Electrónica de consumo' },
            { empresaId: 3, nombre: 'LG', descripcion: 'Electrodomésticos y electrónica' },
        ] : []),

        // Empresa Principal → ropa
        ...(empresaPrincipal ? [
            { empresaId: 1, nombre: 'Nike', descripcion: 'Ropa y calzado deportivo' },
            { empresaId: 1, nombre: 'Adidas', descripcion: 'Indumentaria deportiva' },
            { empresaId: 1, nombre: 'Puma', descripcion: 'Calzado y ropa deportiva' },
            { empresaId: 1, nombre: 'Levi\'s', descripcion: 'Jeans y ropa casual' },
        ] : []),
        ];

        let marcasCreadas = 0;

        for (const marcaData of marcasConEmpresa) {
        const empresa = empresas.find(e => e.id === marcaData.empresaId);

        if (!empresa) {
            console.log(`⚠️ No se encontró empresa con ID ${marcaData.empresaId} para marca ${marcaData.nombre}`);
            continue;
        }

        // Verificar si ya existe
        const marcaExistente = await this.marcaRepo.findOne({
            where: { nombre: marcaData.nombre, empresa_id: empresa.id },
        });

        if (!marcaExistente) {
            const nuevaMarca = this.marcaRepo.create({
            nombre: marcaData.nombre,
            descripcion: marcaData.descripcion,
            empresa_id: empresa.id,
            estado: true,
            });

            await this.marcaRepo.save(nuevaMarca);
            marcasCreadas++;
        } else {
            console.log(`- Marca '${marcaData.nombre}' ya existe para empresa '${empresa.name}'`);
        }
        }

        console.log(`\n🎉 Seed de marcas completado: ${marcasCreadas} marcas nuevas creadas`);
    }
}
