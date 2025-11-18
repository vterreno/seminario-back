import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { CompraEntity } from "./compra.entity";

@Entity('costos-adicionales')
export class CostoAdicionalEntity extends BaseEntity {
    
    @Column({ type: 'varchar', length: 255, nullable: true })
    concepto?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    monto: number;

    @ManyToOne(() => CompraEntity, compra => compra.costosAdicionales, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'compra_id' })
    compra: CompraEntity;

}


