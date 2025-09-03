import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { empresaEntity } from "./empresa.entity";

@Entity("sucursal")
export class sucursalEntity extends BaseEntity{
    @Column()
    name: string
    @Column()
    codigo_sucursal: string
    @Column()
    direccion: string
    @Column({ type: 'boolean', nullable: false, default: true })
    estado: boolean;
    @ManyToOne(() => empresaEntity, empresa => empresa.sucursales)
    @JoinColumn({ name: 'empresa_id' })
    empresa: empresaEntity
}