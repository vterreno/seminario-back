import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ProductoEntity } from "./producto.entity";
import { empresaEntity } from "./empresa.entity";
import { ProductoListaPreciosEntity } from "./producto-lista-precios.entity";


@Entity("lista_precios")
export class ListaPreciosEntity extends BaseEntity{
    @Column()
    @Unique(['nombre'])
    nombre: string

    @Column({ nullable: true })
    descripcion?: string

    @Column({ type: 'boolean',nullable: false, default: true })
    estado: boolean

    @ManyToMany(() => ProductoEntity, producto => producto.listas_precios)
    productos: ProductoEntity[];

    @OneToMany(() => ProductoListaPreciosEntity, productoListaPrecios => productoListaPrecios.listaPrecios)
    productosListasPrecios: ProductoListaPreciosEntity[];

    @ManyToOne(() => empresaEntity, empresa => empresa.listas_precios, { nullable: true })
    @JoinColumn({ name: 'empresa_id' })
    empresa?: empresaEntity;

    @Column({ nullable: true })
    empresa_id: number;
}