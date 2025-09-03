import { UserI } from '../../resource/users/interface/user.interface';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoleEntity } from './roles.entity';
import { BaseEntity } from './base.entity';

@Entity('usuarios')
export class UserEntity extends BaseEntity implements UserI {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  nombre: string

  @Column()
  apellido: string

  @Index({unique:true})
  @Column()
  email: string;

  @Column()
  password: string;
  
  @ManyToOne(() => RoleEntity, (role) => role.users)
  role?: RoleEntity;
  permissions: any;

  @Column({ nullable: true })
  tenant_id?: number;

  get permissionCodes(): string[] {
    if (!this.role || !this.role.permissions) return [];
    return this.role.permissions.map(p => p.nombre);  // o el nombre del campo que tenga el código de permiso
  }
}
