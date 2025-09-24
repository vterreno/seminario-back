import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { sucursalEntity } from "./sucursal.entity";
import { UserEntity } from "./user.entity";
import { RoleEntity } from "./roles.entity";
import { MarcaEntity } from "./marcas.entity";

@Entity("empresa")
export class empresaEntity extends BaseEntity{
    @Column()
    name:string
    @Column({ type: 'boolean', nullable: false, default: true })
    estado: boolean;
    @OneToMany(() => sucursalEntity, sucursal => sucursal.empresa)
    sucursales: sucursalEntity[]
    @OneToMany(() => UserEntity, user => user.empresa)
    usuarios: UserEntity[]
    @OneToMany(() => RoleEntity, role => role.empresa)
    roles: RoleEntity[]

    @OneToMany(() => MarcaEntity, marca => marca.empresa)
    marcas: MarcaEntity[];
}