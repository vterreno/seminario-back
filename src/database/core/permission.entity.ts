
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { RoleEntity } from "./roles.entity";
import { BaseEntity } from "./base.entity";
@Entity('permisos')
export class PermissionEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    nombre: string;
    @Column()
    codigo: string;
    @ManyToMany(() => RoleEntity, role => role.permissions)
    @JoinTable({
        name: 'roles_permisos',
        joinColumn: {
            name: 'roles_id',
            referencedColumnName: 'id'
        },
    })
    roles: RoleEntity;
}