import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { sucursalEntity } from "./sucursal.entity";

@Entity("empresa")
export class empresaEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    name:string
    @OneToMany(() => sucursalEntity, sucursal => sucursal.empresa)
    sucursales: sucursalEntity[]
}