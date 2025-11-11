import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { CompraEntity } from "./compra.entity";
import { ProductoProveedorEntity } from "./producto-proveedor.entity";

@Entity("detalle_compra")
export class DetalleCompraEntity extends BaseEntity {
    @ManyToOne(()=> ProductoProveedorEntity, producto => producto.id)
    @JoinColumn({ name: 'producto_proveedor_id' })
    producto: ProductoProveedorEntity;

    @Column({ type: 'int' })
    cantidad: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @ManyToOne(() => CompraEntity, compra => compra.id)
    @JoinColumn({ name: 'compra_id' })
    compra: CompraEntity;
}