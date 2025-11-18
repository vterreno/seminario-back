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

    @ManyToOne(() => CompraEntity, compra => compra.detalles)
    @JoinColumn({ name: 'compra_id' })
    compra: CompraEntity;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 21 })
    iva_porcentaje: number; // por ejemplo: 21%

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    iva_monto: number; // monto calculado del IVA del ítem

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;
}