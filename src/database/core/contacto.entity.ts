import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { empresaEntity } from "./empresa.entity";
import { provinciaEntity } from "./provincia.entity";
import { ciudadEntity } from "./ciudad.entity";

export type ContactoRol = 'cliente' | 'proveedor' | 'ambos';
export type TipoIdentificacion = 'CUIT' | 'DNI' | 'LE' | 'LC' | 'PASAPORTE' | 'OTRO';
export type CondicionIVA = 'Responsable Inscripto' | 'Monotributista' | 'Exento' | 'Consumidor Final';

@Entity('contactos')
export class contactoEntity extends BaseEntity{
    @Column()
    nombre_razon_social: string;

    @Column({ type: 'varchar', nullable: true })
    tipo_identificacion?: TipoIdentificacion | null;

    @Column({ type: 'varchar', nullable: true })
    numero_identificacion?: string | null;

    @Column({ type: 'varchar', nullable: true })
    condicion_iva?: CondicionIVA | null;

    @Column({ type: 'varchar', nullable: true })
    email?: string | null;

    @Column({ type: 'varchar', nullable: true })
    telefono_movil?: string | null;

    // Dirección principal
    @Column({ type: 'varchar', nullable: true })
    direccion_calle?: string | null;

    @Column({ type: 'varchar', nullable: true })
    direccion_numero?: string | null;

    @Column({ type: 'varchar', nullable: true })
    direccion_piso_dpto?: string | null;

    @Column({ type: 'varchar', nullable: true })
    codigo_postal?: string | null;

    @Column({ type: 'boolean', nullable: false, default: true })
    estado: boolean;

    @Column({ type: 'varchar', nullable: false, default: 'cliente' })
    rol: ContactoRol;

    @Column({ type: 'boolean', nullable: false, default: false })
    es_consumidor_final: boolean;

    @Column({ type: 'boolean', nullable: false, default: false })
    es_empresa: boolean;

    @Column({ name: 'empresa_id', nullable: true })
    empresa_id: number;

    @ManyToOne(() => empresaEntity, empresa => empresa.contactos)
    @JoinColumn({ name: 'empresa_id' })
    empresa: empresaEntity;

    @Column({ name: 'provincia_id', nullable: true })
    provincia_id?: number | null;

    @ManyToOne(() => provinciaEntity, provincia => provincia.ciudades, { nullable: true })
    @JoinColumn({ name: 'provincia_id' })
    provincia?: provinciaEntity | null;

    @Column({ name: 'ciudad_id', nullable: true })
    ciudad_id?: number | null;

    @ManyToOne(() => ciudadEntity, ciudad => ciudad.contactos, { nullable: true })
    @JoinColumn({ name: 'ciudad_id' })
    ciudadRef?: ciudadEntity | null;
}


