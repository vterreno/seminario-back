import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { contactoEntity } from "./contacto.entity";
import { sucursalEntity } from "./sucursal.entity";
import { EstadoCompra } from "./enums/EstadoCompra.enum";
import { DetalleCompraEntity } from "./detalleCompra.entity";

@Entity('compras')
export class CompraEntity extends BaseEntity{
    @Column({ type: 'int'})
    numero_compra: number;

    @Column({type: 'timestamp'})
    fecha_compra: Date;

    @OneToMany(() => DetalleCompraEntity, detalleCompra => detalleCompra.compra, { cascade: true })
    detalles: DetalleCompraEntity[];

    @Column({type: 'decimal', precision: 10, scale: 2})
    monto_total: number;

    @ManyToOne(()=> contactoEntity, contacto => contacto.compras)
    @JoinColumn({ name: 'contacto_id' })
    contacto: contactoEntity;

    @ManyToOne(() => sucursalEntity, sucursal => sucursal.id)
    @JoinColumn({ name: 'sucursal_id' })
    sucursal: sucursalEntity;

    @Column({type : 'enum', enum: EstadoCompra, default: EstadoCompra.PENDIENTE_PAGO})
    estado: EstadoCompra;

    @Column({ type: 'varchar', length: 100, nullable: true })
    numero_factura?: string;

    @Column({ type: 'text', nullable: true })
    observaciones?: string;
}