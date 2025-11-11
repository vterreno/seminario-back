import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ProductoEntity } from "./producto.entity";
import { contactoEntity } from "./contacto.entity";

@Entity("producto_proveedor")
export class ProductoProveedorEntity extends BaseEntity {
    @Column({ type: 'int' })
    producto_id: number;

    @Column({ type: 'int' })
    proveedor_id: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    precio_proveedor: number;

    @Column({ type: 'varchar', nullable: true })
    codigo_proveedor?: string;

    @ManyToOne(() => ProductoEntity, producto => producto.productosListasPrecios, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'producto_id' })
    producto: ProductoEntity;

    @ManyToOne(() => contactoEntity, proveedor => proveedor.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'proveedor_id' })
    proveedor: contactoEntity;
}
