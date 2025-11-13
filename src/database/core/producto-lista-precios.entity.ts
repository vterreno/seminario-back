import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { BaseEntityWithoutId } from "./base.entity";
import { ProductoEntity } from "./producto.entity";
import { ListaPreciosEntity } from "./lista-precios.entity";

@Entity("producto_lista_precios")
export class ProductoListaPreciosEntity extends BaseEntityWithoutId {
    @PrimaryColumn()
    producto_id: number;

    @PrimaryColumn()
    lista_precios_id: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    precio_venta_especifico: number;

    @ManyToOne(() => ProductoEntity, producto => producto.productosListasPrecios, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'producto_id' })
    producto: ProductoEntity;

    @ManyToOne(() => ListaPreciosEntity, listaPrecios => listaPrecios.productosListasPrecios, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lista_precios_id' })
    listaPrecios: ListaPreciosEntity;
}
