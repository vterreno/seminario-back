
import { Column, Entity, ManyToMany } from "typeorm";
import { RoleEntity } from "./roles.entity";
import { BaseEntity } from "./base.entity";
@Entity('permisos')
export class PermissionEntity extends BaseEntity{
    @Column()
    nombre: string;
    
    @Column({ unique: true })
    codigo: string;
    
    @ManyToMany(() => RoleEntity, role => role.permissions)
    roles: RoleEntity;
}