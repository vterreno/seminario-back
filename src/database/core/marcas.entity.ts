

import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { empresaEntity } from "./empresa.entity";
import { ProductoEntity } from "./producto.entity";
@Entity('marcas')
export class MarcaEntity extends BaseEntity{
    @Column()
    nombre: string;
    
    @Column({ nullable: true })
    descripcion?: string;

    @Column({ name: 'empresa_id', nullable: true })
    empresa_id: number;

    @ManyToOne(() => empresaEntity, empresa => empresa.marcas, { nullable: true })
    @JoinColumn({ name: 'empresa_id' })
    empresa?: empresaEntity;
    
    @Column({ type: 'boolean', nullable: false, default: true })
    estado: boolean; 

    @OneToMany(() => ProductoEntity, producto => producto.marca)
    productos: ProductoEntity[];
}
