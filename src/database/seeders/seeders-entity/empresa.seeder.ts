
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { empresaEntity } from '../../core/empresa.entity';

@Injectable()
export class EmpresaSeeder {
    constructor(
        @InjectRepository(empresaEntity)
        private readonly empresaRepository: Repository<empresaEntity>,
    ) {}

    async run() {
        const empresas = [
            { name: 'TechCorp S.A.', estado: true },
            { name: 'FoodMarket Ltda.', estado: true },
        ];

        const totalEmpresas = await this.empresaRepository.count();
        if (totalEmpresas === 0) {
            for (const empresa of empresas) {
                const newEmpresa = new empresaEntity();
                newEmpresa.name = empresa.name;
                newEmpresa.estado = empresa.estado;

                await this.empresaRepository.save(newEmpresa);
            }
            console.log('Empresas creadas desde el seeder');
        } else {
            console.log('Ya existen empresas, no se crea ninguna');
        }
    }
}
