import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ProductoEntity } from "./producto.entity";
import { ventaEntity } from "./venta.entity";

@Entity("detalle_venta")
export class detalleVentaEntity extends BaseEntity {
    @ManyToOne(()=> ProductoEntity, producto => producto.id)
    @JoinColumn({ name: 'producto_id' })
    producto: ProductoEntity;

    @Column({ type: 'int' })
    cantidad: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @ManyToOne(() => ventaEntity, venta => venta.id)
    @JoinColumn({ name: 'venta_id' })
    venta: ventaEntity;
}