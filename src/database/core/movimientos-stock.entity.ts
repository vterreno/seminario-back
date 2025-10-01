import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { TipoMovimientoStock } from "./enums/TipoMovimientoStock.enum";
import { empresaEntity } from "./empresa.entity";
import { ProductoEntity } from "./producto.entity";

@Entity('movimiento-stock')
export class MovimientoStockEntity extends BaseEntity{
    @Column()
    fecha: Date;
    @Column({type : 'enum', enum: TipoMovimientoStock, default: TipoMovimientoStock.STOCK_APERTURA})
    tipo_movimiento: TipoMovimientoStock;
    @Column()
    descripcion: string;
    @Column()
    cantidad: number;
    @Column()
    stock_resultante: number;

    @ManyToOne(() => empresaEntity, (empresa) => empresa.movimientos)
    @JoinColumn({ name: 'empresa_id' })
    empresa: empresaEntity;

    @Column()
    empresa_id: number;

    @ManyToOne(() => ProductoEntity, (producto) => producto.movimientos)
    @JoinColumn({ name: 'producto_id' })
    producto: ProductoEntity;

    @Column()
    producto_id: number;
}