import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { empresaEntity } from "./empresa.entity";

@Entity("sucursales")
export class sucursalEntity extends BaseEntity{
    @Column()
    nombre: string;
    
    @Column()
    codigo: string;
    
    @Column()
    direccion: string;
    
    @Column({ type: 'boolean', nullable: false, default: true })
    estado: boolean;
    
    @Column({ name: 'empresa_id', nullable: true })
    empresa_id: number;
    
    @ManyToOne(() => empresaEntity, empresa => empresa.sucursales)
    @JoinColumn({ name: 'empresa_id' })
    empresa: empresaEntity;
}