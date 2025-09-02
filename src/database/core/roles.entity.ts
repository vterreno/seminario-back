import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PermissionEntity } from "./permission.entity";
import { UserEntity } from "./user.entity";
import { BaseEntity } from "./base.entity";

@Entity('roles')
export class RoleEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;

    @ManyToMany(() => PermissionEntity, permission => permission.roles)
    @JoinTable()
    permissions: PermissionEntity[];

    @OneToMany(() => UserEntity, user => user.role)
    users: UserEntity[];
}