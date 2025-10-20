import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ventaEntity } from "./venta.entity";
import { empresaEntity } from "./empresa.entity";
import { sucursalEntity } from "./sucursal.entity";

export type metodoPago = 'efectivo' | 'transferencia' ;

@Entity('pagos')
export class pagoEntity extends BaseEntity{
    @Column({type: 'timestamp'})
    fecha_pago: Date;

    @Column({type: 'decimal', precision: 10, scale: 2})
    monto_pago: number;

    @Column({ type: 'varchar'})
    metodo_pago: metodoPago;

    @OneToOne(() => ventaEntity, venta => venta.pago)
    venta: ventaEntity;

    @ManyToOne(() => sucursalEntity, sucursal => sucursal.pagos)
    sucursal: sucursalEntity;
}