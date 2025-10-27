import { Column, Entity, JoinColumn, ManyToOne, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { empresaEntity } from "./empresa.entity";
import { ventaEntity } from "./venta.entity";
import { pagoEntity } from "./pago.entity";
import { ProductoEntity } from "./producto.entity";
import { MovimientoStockEntity } from "./movimientos-stock.entity";
import { ListaPreciosEntity } from "./lista-precios.entity";
import { UserEntity } from "./user.entity";

@Entity("sucursales")
export class sucursalEntity extends BaseEntity{
    @Column()
    nombre: string;
    
    @Column()
    codigo: string;
    
    @Column()
    direccion: string;
    
    @Column({ type: 'boolean', nullable: false, default: true })
    estado: boolean;
    
    @Column({ name: 'empresa_id', nullable: true })
    empresa_id: number;
    
    @ManyToOne(() => empresaEntity, empresa => empresa.sucursales)
    @JoinColumn({ name: 'empresa_id' })
    empresa: empresaEntity;

    @Column({ type: 'int', default: 0 })
    numero_venta: number;

    @OneToMany(() => ventaEntity, venta => venta.sucursal)
    ventas: ventaEntity[];

    @OneToMany(() => pagoEntity, pago => pago.sucursal)
    pagos: pagoEntity[];

    @OneToMany(() => ProductoEntity, producto => producto.sucursal)
    productos: ProductoEntity[];

    @OneToMany(() => MovimientoStockEntity, movimiento => movimiento.sucursal)
    movimientos: MovimientoStockEntity[];

    @ManyToMany(() => UserEntity, user => user.sucursales)
    usuarios?: UserEntity[];

}