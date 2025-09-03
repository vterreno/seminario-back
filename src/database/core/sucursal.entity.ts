import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { empresaEntity } from "./empresa.entity";

@Entity("sucursal")
export class sucursalEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    name: string
    @Column()
    codigo_sucursal: string
    @Column()
    direccion: string
    @ManyToOne(() => empresaEntity, empresa => empresa.sucursales)
    empresa: empresaEntity
}