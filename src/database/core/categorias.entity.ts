import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { empresaEntity } from "./empresa.entity";
import { BaseEntity } from "./base.entity";

@Entity("categorias")
@Unique(["nombre", "empresa"])
export class categoriasEntity extends BaseEntity{
    @Column({ nullable: false })
    nombre: string;

    @Column({ nullable: true })
    descripcion: string;

    @Column({ type: 'boolean', default: true, nullable: false })
    estado: boolean;

    @ManyToOne(() => empresaEntity, empresa => empresa.categorias, { nullable: true })
    @JoinColumn({ name: "empresa_id" })
    empresa?: empresaEntity;

    @Column({ nullable: true, name: "empresa_id" })
    empresa_id: number;

    // TODO AGREGAR RELACION CON PRODUCTOS
}