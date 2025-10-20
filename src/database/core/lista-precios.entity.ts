import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ProductoEntity } from "./producto.entity";
import { empresaEntity } from "./empresa.entity";
import { ProductoListaPreciosEntity } from "./producto-lista-precios.entity";
import { sucursalEntity } from "./sucursal.entity";


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

    @ManyToOne(() => sucursalEntity, sucursal => sucursal.listas_precios, { nullable: true })
    @JoinColumn({ name: 'sucursal_id' })
    sucursal?: sucursalEntity;

    @Column({ nullable: true })
    sucursal_id: number;
}