import { Column, Entity, JoinTable, ManyToMany, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { PermissionEntity } from "./permission.entity";
import { UserEntity } from "./user.entity";
import { BaseEntity } from "./base.entity";
import { empresaEntity } from "./empresa.entity";

@Entity('roles')
export class RoleEntity extends BaseEntity{
    @Column()
    nombre: string;

    @Column({ nullable: true })
    empresa_id: number;

    @Column({ type: 'boolean', nullable: false, default: true })
    estado: boolean;

    @ManyToOne(() => empresaEntity, empresa => empresa.roles, { nullable: true })
    @JoinColumn({ name: 'empresa_id' })
    empresa?: empresaEntity;

    @ManyToMany(() => PermissionEntity, permission => permission.roles)
    @JoinTable({
        name: 'roles_permisos',
        joinColumn: {
            name: 'roles_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'permisos_id',
            referencedColumnName: 'id'
        },
    })
    permissions: PermissionEntity[];

    @OneToMany(() => UserEntity, user => user.role)
    users: UserEntity[];
}