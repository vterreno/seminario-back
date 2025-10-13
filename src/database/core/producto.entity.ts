import { Column, Entity, JoinTable, ManyToMany, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { empresaEntity } from "./empresa.entity";
import { MarcaEntity } from "./marcas.entity";
import { MovimientoStockEntity } from "./movimientos-stock.entity";
import { ListaPreciosEntity } from "./lista-precios.entity";
import { ProductoListaPreciosEntity } from "./producto-lista-precios.entity";
import { categoriasEntity } from "./categorias.entity";
import { UnidadMedidaEntity } from "./unidad-medida.entity";

@Entity('productos')
export class ProductoEntity extends BaseEntity{
    @Column()
    nombre: string;

    @Column({ unique: true })
    codigo: string;

    @ManyToOne(() => empresaEntity, empresa => empresa.productos, { nullable: true })
    @JoinColumn({ name: 'empresa_id' })
    empresa?: empresaEntity;

    @Column({ nullable: true })
    empresa_id: number;

    //Relacion con Categoria
    @ManyToOne(() => categoriasEntity, categoria => categoria.productos, { nullable: true })
    @JoinColumn({ name: 'categoria_id' })
    categoria?: categoriasEntity;

    @Column({ nullable: true })
    categoria_id: number;

    @ManyToOne(() => MarcaEntity, marca => marca.productos, { nullable: true })
    @JoinColumn({ name: 'marca_id' })
    marca?: MarcaEntity;

    @Column({ nullable: true })
    marca_id: number;

    //Relacion con unidad de medida
    @ManyToOne(() => UnidadMedidaEntity, unidadMedida => unidadMedida.productos, { nullable: true })
    @JoinColumn({ name: 'unidad_medida_id' })
    unidadMedida?: UnidadMedidaEntity;

    @Column({ nullable: true })
    unidad_medida_id: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    precio_costo: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    precio_venta: number;

    @Column({ type: 'boolean', nullable: false, default: true })
    estado: boolean;

    @Column({ nullable: false, default: 0 })
    stock_apertura: number;

    @Column({ nullable: false, default: 0 })
    stock: number;

    @OneToMany(() => MovimientoStockEntity  , movimiento => movimiento.producto)
    @JoinColumn({ name: 'movimientos_id' })
    movimientos: MovimientoStockEntity[];

    @ManyToMany(() => ListaPreciosEntity, listaPrecios => listaPrecios.productos)
    @JoinTable({
        name: 'producto_lista_precios',
        joinColumn: { name: 'producto_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'lista_precios_id', referencedColumnName: 'id' }
    })
    listas_precios: ListaPreciosEntity[];

    @OneToMany(() => ProductoListaPreciosEntity, productoListaPrecios => productoListaPrecios.producto)
    productosListasPrecios: ProductoListaPreciosEntity[];
}