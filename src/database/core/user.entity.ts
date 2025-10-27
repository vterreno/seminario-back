import { UserI } from '../../resource/users/interface/user.interface';
import { Column, Entity, Index, ManyToOne, ManyToMany, JoinTable, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { RoleEntity } from './roles.entity';
import { BaseEntity } from './base.entity';
import { empresaEntity } from './empresa.entity';
import { sucursalEntity } from './sucursal.entity';

@Entity('usuarios')
export class UserEntity extends BaseEntity implements UserI {
  @Column()
  nombre: string

  @Column()
  apellido: string

  @Index({unique:true})
  @Column()
  email: string;

  @Column()
  password: string;
  
  @Column({ name: 'role_id', nullable: true })
  role_id: number;

  @ManyToOne(() => RoleEntity, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity;

  @Column({ name: 'empresa_id', nullable: true })
  empresa_id: number;

  @ManyToOne(() => empresaEntity, empresa => empresa.usuarios, { nullable: true })
  @JoinColumn({ name: 'empresa_id' })
  empresa?: empresaEntity;

  @ManyToMany(() => sucursalEntity, sucursal => sucursal.usuarios)
  @JoinTable({
    name: 'usuarios_sucursales',
    joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'sucursal_id', referencedColumnName: 'id' }
  })
  sucursales?: sucursalEntity[];

  @Column({ default: true })
  status: boolean;

  // Método para verificar si el usuario es superadmin (sin empresa asignada)
  get isSuperAdmin(): boolean {
    return !this.empresa_id;
  }

  // Obtener códigos de permisos del rol
  get permissionCodes(): string[] {
    if (!this.role || !this.role.permissions) return [];
    return this.role.permissions.map(p => p.codigo || p.nombre);
  }

  // Para compatibilidad con la interfaz UserI
  get permissions(): any {
    if (!this.role || !this.role.permissions) return [];
    return this.role.permissions;
  }
}
