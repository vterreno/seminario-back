
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { RoleEntity } from "./roles.entity";
import { BaseEntity } from "./base.entity";
@Entity('permisos')
export class PermissionEntity extends BaseEntity{
    @Column()
    nombre: string;
    @Column()
    codigo: string;
    @ManyToMany(() => RoleEntity, role => role.permissions)
    roles: RoleEntity;
}