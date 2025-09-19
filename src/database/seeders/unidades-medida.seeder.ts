import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadMedida } from '../core/unidad-medida.entity';

@Injectable()
export class UnidadesMedidaSeeder {
  constructor(
    @InjectRepository(UnidadMedida)
    private readonly unidadMedidaRepository: Repository<UnidadMedida>,
  ) {}

  async seed(empresaId: number = 1): Promise<void> {
    // Verificar si ya existen unidades para esta empresa
    const existingCount = await this.unidadMedidaRepository.count({
      where: { empresaId },
    });

    if (existingCount > 0) {
      console.log(`Unidades de medida ya existen para empresa ${empresaId}, saltando seeder`);
      return;
    }

    const unidadesPredeterminadas = [
      {
        nombre: 'Kilogramo',
        abreviatura: 'kg',
        aceptaDecimales: true,
        empresaId,
      },
      {
        nombre: 'Gramo',
        abreviatura: 'g',
        aceptaDecimales: true,
        empresaId,
      },
      {
        nombre: 'Litro',
        abreviatura: 'L',
        aceptaDecimales: true,
        empresaId,
      },
      {
        nombre: 'Mililitro',
        abreviatura: 'ml',
        aceptaDecimales: true,
        empresaId,
      },
      {
        nombre: 'Unidad',
        abreviatura: 'u',
        aceptaDecimales: false,
        empresaId,
      },
      {
        nombre: 'Caja',
        abreviatura: 'caja',
        aceptaDecimales: false,
        empresaId,
      },
      {
        nombre: 'Paquete',
        abreviatura: 'paq',
        aceptaDecimales: false,
        empresaId,
      },
      {
        nombre: 'Metro',
        abreviatura: 'm',
        aceptaDecimales: true,
        empresaId,
      },
      {
        nombre: 'Metro Cuadrado',
        abreviatura: 'm²',
        aceptaDecimales: true,
        empresaId,
      },
      {
        nombre: 'Metro Cúbico',
        abreviatura: 'm³',
        aceptaDecimales: true,
        empresaId,
      },
    ];

    for (const unidad of unidadesPredeterminadas) {
      const newUnidad = this.unidadMedidaRepository.create(unidad);
      await this.unidadMedidaRepository.save(newUnidad);
    }

    console.log(`Se crearon ${unidadesPredeterminadas.length} unidades de medida para empresa ${empresaId}`);
  }
}