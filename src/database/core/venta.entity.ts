import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { contactoEntity } from "./contacto.entity";
import { sucursalEntity } from "./sucursal.entity";
import { detalleVentaEntity } from "./detalleVenta.entity";
import { pagoEntity } from "./pago.entity";

@Entity('ventas')
export class ventaEntity extends BaseEntity{
    @Column({ type: 'int'})
    numero_venta: number;

    @Column({type: 'timestamp'})
    fecha_venta: Date;

    @OneToMany(() => detalleVentaEntity, detalleVenta => detalleVenta.venta, { cascade: true })
    detalles: detalleVentaEntity[];

    @Column({type: 'decimal', precision: 10, scale: 2})
    monto_total: number;

    @ManyToOne(()=> contactoEntity, contacto => contacto.id)
    @JoinColumn({ name: 'contacto_id' })
    contacto: contactoEntity;

    @ManyToOne(() => sucursalEntity, sucursal => sucursal.id)
    @JoinColumn({ name: 'sucursal_id' })
    sucursal: sucursalEntity;

    @OneToOne(() => pagoEntity, pago => pago.id)
    @JoinColumn({ name: 'pago_id' })
    pago: pagoEntity;
}