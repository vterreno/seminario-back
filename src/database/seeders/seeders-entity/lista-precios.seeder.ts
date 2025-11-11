import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListaPreciosEntity } from 'src/database/core/lista-precios.entity';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { ProductoListaPreciosEntity } from 'src/database/core/producto-lista-precios.entity';

@Injectable()
export class ListaPreciosSeeder {
  constructor(
    @InjectRepository(ListaPreciosEntity)
    private readonly listaPreciosRepo: Repository<ListaPreciosEntity>,
    @InjectRepository(empresaEntity)
    private readonly empresaRepo: Repository<empresaEntity>,
    @InjectRepository(ProductoEntity)
    private readonly productoRepo: Repository<ProductoEntity>,
    @InjectRepository(ProductoListaPreciosEntity)
    private readonly prodListaPrecioRepo: Repository<ProductoListaPreciosEntity>,
  ) {}

  async run() {
    console.log('💰 Iniciando seeder de listas de precios...');

    const totalListas = await this.listaPreciosRepo.count();
    if (totalListas > 0) {
      console.log('💰 Ya existen listas de precios, saltando seeder');
      return;
    }

    // Obtener empresas
    const empresaTech = await this.empresaRepo.findOne({ where: { name: 'TechCorp S.A.' } });
    const empresaFood = await this.empresaRepo.findOne({ where: { name: 'FoodMarket Ltda.' } });

    if (!empresaTech || !empresaFood) {
      console.log('❌ No se encontraron las empresas');
      return;
    }

    // Crear listas de precios
    const listaTech = this.listaPreciosRepo.create({
      nombre: 'Lista TechCorp 2025',
      descripcion: 'Lista oficial de precios de productos tecnológicos',
      estado: true,
      empresa: empresaTech,
    });

    const listaFood = this.listaPreciosRepo.create({
      nombre: 'Lista FoodMarket 2025',
      descripcion: 'Lista oficial de precios de productos alimenticios',
      estado: true,
      empresa: empresaFood,
    });

    await this.listaPreciosRepo.save([listaTech, listaFood]);

    console.log('✅ Listas de precios creadas');

    // Obtener productos por empresa (ajustado para la nueva estructura)
    const productosTech = await this.productoRepo.find({
      where: { sucursal: { empresa: { id: empresaTech.id } } },
      relations: ['sucursal', 'sucursal.empresa'],
    });

    const productosFood = await this.productoRepo.find({
      where: { sucursal: { empresa: { id: empresaFood.id } } },
      relations: ['sucursal', 'sucursal.empresa'],
    });

    console.log(`📦 Encontrados ${productosTech.length} productos de TechCorp`);
    console.log(`📦 Encontrados ${productosFood.length} productos de FoodMarket`);

    // Insertar relaciones en producto_lista_precios para TechCorp
    for (const producto of productosTech) {
      const relacion = this.prodListaPrecioRepo.create({
        producto: producto,
        listaPrecios: listaTech, // <-- nombre correcto
        precio_venta_especifico: Number(producto.precio_venta) * 1.05, // 5% más caro
      });
      await this.prodListaPrecioRepo.save(relacion);
    }

    // Insertar relaciones en producto_lista_precios para FoodMarket
    for (const producto of productosFood) {
      const relacion = this.prodListaPrecioRepo.create({
        producto: producto,
        listaPrecios: listaFood,
        precio_venta_especifico: Number(producto.precio_venta) * 0.95, // 5% más barato
      });
      await this.prodListaPrecioRepo.save(relacion);
    }

    console.log(`✅ ${productosTech.length + productosFood.length} productos asociados a listas de precios`);
    console.log('🎉 Seeder de listas de precios completado');
  }
}