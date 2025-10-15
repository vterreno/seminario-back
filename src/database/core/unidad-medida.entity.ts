import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { empresaEntity } from './empresa.entity';
import { ProductoEntity } from './producto.entity';
import e from 'express';

@Entity('unidades_medida')
@Index(['nombre', 'empresa_id'], { unique: true })
@Index(['abreviatura', 'empresa_id'], { unique: true })
export class UnidadMedidaEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  abreviatura: string;

  @Column({ type: 'boolean', default: false, name: 'acepta_decimales' })
  aceptaDecimales: boolean;
  
  @Column({ nullable: true })
  empresa_id: number;

  @ManyToOne(() => empresaEntity, empresa => empresa.unidadesMedida, { nullable: false })
  @JoinColumn({ name: 'empresa_id' })
  empresa?: empresaEntity;

  // Relación inversa con productos (opcional)
  @OneToMany(() => ProductoEntity, producto => producto.unidadMedida)
  @JoinColumn({ name: 'productos_id' })
  productos: ProductoEntity[];

  @Column({ name: 'productos_id', nullable: true })
  productos_id: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

}