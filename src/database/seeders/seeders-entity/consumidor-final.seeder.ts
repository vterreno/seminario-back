import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { empresaEntity } from '../../core/empresa.entity';
import { contactoEntity } from '../../core/contacto.entity';

@Injectable()
export class ConsumidorFinalSeeder {
    constructor(
        @InjectRepository(empresaEntity)
        private readonly empresaRepository: Repository<empresaEntity>,
        @InjectRepository(contactoEntity)
        private readonly contactoRepository: Repository<contactoEntity>,
    ) {}

    async run() {
        // Traer todas las empresas activas
        const empresas = await this.empresaRepository.find({ where: { estado: true } });

        for (const empresa of empresas) {
            // Verificar si ya existe el consumidor final en esta empresa
            const existe = await this.contactoRepository.findOne({
                where: { empresa: { id: empresa.id }, es_consumidor_final: true },
            });

            if (!existe) {
                const nuevoConsumidor = this.contactoRepository.create({
                    nombre_razon_social: 'Consumidor Final',
                    condicion_iva: 'Consumidor Final',
                    rol: 'cliente',
                    es_consumidor_final: true,
                    estado: true,
                    empresa: empresa,
                    tipo_identificacion: 'DNI',
                    numero_identificacion: '00-00000000-0',
                });

                await this.contactoRepository.save(nuevoConsumidor);
                console.log(`Consumidor Final creado para empresa: ${empresa.name}`);
            } else {
                console.log(`La empresa ${empresa.name} ya tiene Consumidor Final`);
            }
        }
    }
}
