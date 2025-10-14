import { Column, Entity, JoinTable, ManyToMany, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { sucursalEntity } from "./sucursal.entity";
import { MarcaEntity } from "./marcas.entity";
import { MovimientoStockEntity } from "./movimientos-stock.entity";

@Entity('productos')
export class ProductoEntity extends BaseEntity{
    @Column()
    nombre: string;

    @Column({ unique: true })
    codigo: string;

    @ManyToOne(() => sucursalEntity, sucursal => sucursal.productos, { nullable: true })
    @JoinColumn({ name: 'sucursal_id' })
    sucursal?: sucursalEntity;

    @Column({ nullable: true })
    sucursal_id: number;

    //Relacion con Categoria
    //@ManyToOne(() => categoriaEntity, categoria => categoria.productos, { nullable: true })
    //@JoinColumn({ name: 'categoria_id' })
    //categoria?: categoriaEntity;

    //@Column({ nullable: true })
    //categoria_id: number;

    @ManyToOne(() => MarcaEntity, marca => marca.productos, { nullable: true })
    @JoinColumn({ name: 'marca_id' })
    marca?: MarcaEntity;

    @Column({ nullable: true })
    marca_id: number;

    //Relacion con unidad de medida
    //@ManyToOne(() => unidadMedidaEntity, unidadMedida => unidadMedida.productos, { nullable: true })
    //@JoinColumn({ name: 'unidad_medida_id' })
    //unidadMedida?: unidadMedidaEntity;

    //@Column({ nullable: true })
    //unidad_medida_id: number;

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
}