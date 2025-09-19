import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { empresaEntity } from './empresa.entity';

@Entity('unidades_medida')
@Index(['nombre', 'empresaId'], { unique: true })
@Index(['abreviatura', 'empresaId'], { unique: true })
export class UnidadMedida extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  abreviatura: string;

  @Column({ type: 'boolean', default: false, name: 'acepta_decimales' })
  aceptaDecimales: boolean;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @ManyToOne(() => empresaEntity, { nullable: false })
  @JoinColumn({ name: 'empresa_id' })
  empresa: empresaEntity;
}