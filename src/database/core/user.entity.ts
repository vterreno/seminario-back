import { UserI } from '../../resource/users/interface/user.interface';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, JoinColumn, IsNull } from 'typeorm';
import { RoleEntity } from './roles.entity';
import { BaseEntity } from './base.entity';
import { empresaEntity } from './empresa.entity';

@Entity('usuarios')
export class UserEntity extends BaseEntity implements UserI {;
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
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity;
  permissions: any;

  @ManyToOne(() => empresaEntity, empresa => empresa.usuarios, { nullable: true })
  @JoinColumn({ name: 'empresa_id' })
  empresa?: empresaEntity;

  get permissionCodes(): string[] {
    if (!this.role || !this.role.permissions) return [];
    return this.role.permissions.map(p => p.nombre);  // o el nombre del campo que tenga el código de permiso
  }
}
