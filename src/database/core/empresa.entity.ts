import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { sucursalEntity } from "./sucursal.entity";
import { UserEntity } from "./user.entity";
import { RoleEntity } from "./roles.entity";
import { categoriasEntity } from "./categorias.entity";
import { contactoEntity } from "./contacto.entity";
import { MarcaEntity } from "./marcas.entity";
import { pagoEntity } from "./pago.entity";
import { UnidadMedidaEntity } from "./unidad-medida.entity";
import { ListaPreciosEntity } from "./lista-precios.entity";

@Entity("empresa")
export class empresaEntity extends BaseEntity{
    @Column()
    name:string

    @Column({ type: 'boolean', nullable: false, default: true })
    estado: boolean;

    @OneToMany(() => sucursalEntity, sucursal => sucursal.empresa)
    sucursales: sucursalEntity[]

    @OneToMany(() => UserEntity, user => user.empresa)
    usuarios: UserEntity[]

    @OneToMany(() => RoleEntity, role => role.empresa)
    roles: RoleEntity[]

    @OneToMany(() => contactoEntity, contacto => contacto.empresa)
    contactos: contactoEntity[]

    @OneToMany(() => categoriasEntity, categorias => categorias.empresa)
    categorias: categoriasEntity[]

    @OneToMany(() => MarcaEntity, marca => marca.empresa)
    marcas: MarcaEntity[];

    @OneToMany(() => UnidadMedidaEntity, unidadMedida => unidadMedida.empresa)
    unidadesMedida: UnidadMedidaEntity[];

    @OneToMany(() => ListaPreciosEntity, listaPrecios => listaPrecios.empresa)
    listas_precios: ListaPreciosEntity[];
}