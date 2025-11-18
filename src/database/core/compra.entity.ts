import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { contactoEntity } from "./contacto.entity";
import { sucursalEntity } from "./sucursal.entity";
import { EstadoCompra } from "./enums/EstadoCompra.enum";
import { DetalleCompraEntity } from "./detalleCompra.entity";
import { pagoEntity } from "./pago.entity";
import { CostoAdicionalEntity } from "./costo-adicionales.entity";

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

    @ManyToOne(() => sucursalEntity, sucursal => sucursal.compras)
    @JoinColumn({ name: 'sucursal_id' })
    sucursal: sucursalEntity;

    @Column({type : 'enum', enum: EstadoCompra, default: EstadoCompra.PENDIENTE_PAGO})
    estado: EstadoCompra;

    @OneToOne(() => pagoEntity, pago => pago.compra, { nullable: true })
    @JoinColumn({ name: 'pago_id' })
    pago?: pagoEntity;

    @Column({ type: 'varchar', length: 100, nullable: true })
    numero_factura?: string;

    @Column({ type: 'text', nullable: true })
    observaciones?: string;

    @OneToMany(() => CostoAdicionalEntity, costoAdicional => costoAdicional.compra, { cascade: true, eager: true })
    costosAdicionales: CostoAdicionalEntity[];
}