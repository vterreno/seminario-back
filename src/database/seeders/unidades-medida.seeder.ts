import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadMedida } from '../core/unidad-medida.entity';
import { empresaEntity } from '../core/empresa.entity';

@Injectable()
export class UnidadesMedidaSeeder {
  constructor(
    @InjectRepository(UnidadMedida)
    private readonly unidadMedidaRepository: Repository<UnidadMedida>,
    @InjectRepository(empresaEntity)
    private readonly empresaRepository: Repository<empresaEntity>,
  ) {}

  async run(): Promise<void> {
    // Obtener todas las empresas
    const empresas = await this.empresaRepository.find({
      where: { estado: true }
    });

    if (empresas.length === 0) {
      console.log('No se encontraron empresas activas para crear unidades de medida');
      return;
    }

    const unidadesPredeterminadas = [
      {
        nombre: 'Kilogramo',
        abreviatura: 'kg',
        aceptaDecimales: true,
      },
      {
        nombre: 'Gramo',
        abreviatura: 'g',
        aceptaDecimales: true,
      },
      {
        nombre: 'Litro',
        abreviatura: 'L',
        aceptaDecimales: true,
      },
      {
        nombre: 'Mililitro',
        abreviatura: 'ml',
        aceptaDecimales: true,
      },
      {
        nombre: 'Unidad',
        abreviatura: 'u',
        aceptaDecimales: false,
      },
      {
        nombre: 'Caja',
        abreviatura: 'caja',
        aceptaDecimales: false,
      },
      {
        nombre: 'Paquete',
        abreviatura: 'paq',
        aceptaDecimales: false,
      },
      {
        nombre: 'Metro',
        abreviatura: 'm',
        aceptaDecimales: true,
      },
      {
        nombre: 'Metro Cuadrado',
        abreviatura: 'm²',
        aceptaDecimales: true,
      },
      {
        nombre: 'Metro Cúbico',
        abreviatura: 'm³',
        aceptaDecimales: true,
      },
    ];

    let totalCreadas = 0;

    // Crear unidades para cada empresa
    for (const empresa of empresas) {
      // Verificar si ya existen unidades para esta empresa
      const existingCount = await this.unidadMedidaRepository.count({
        where: { empresaId: empresa.id },
      });

      if (existingCount > 0) {
        console.log(`Unidades de medida ya existen para empresa ${empresa.name} (ID: ${empresa.id}), saltando`);
        continue;
      }

      // Crear las unidades para esta empresa
      for (const unidadData of unidadesPredeterminadas) {
        const newUnidad = this.unidadMedidaRepository.create({
          ...unidadData,
          empresaId: empresa.id,
        });
        await this.unidadMedidaRepository.save(newUnidad);
      }

      totalCreadas += unidadesPredeterminadas.length;
      console.log(`Se crearon ${unidadesPredeterminadas.length} unidades de medida para empresa ${empresa.name} (ID: ${empresa.id})`);
    }

    console.log(`Proceso completado. Se crearon un total de ${totalCreadas} unidades de medida para ${empresas.length} empresas`);
  }
}