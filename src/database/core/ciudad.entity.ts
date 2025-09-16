import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { provinciaEntity } from "./provincia.entity";
import { contactoEntity } from "./contacto.entity";

@Entity('ciudades')
export class ciudadEntity extends BaseEntity {
    @Column()
    nombre: string;

    @Column({ type: 'varchar' })
    codigo_postal: string;

    @Column({ name: 'provincia_id' })
    provincia_id: number;

    @ManyToOne(() => provinciaEntity, provincia => provincia.ciudades)
    @JoinColumn({ name: 'provincia_id' })
    provincia: provinciaEntity;

    @OneToMany(() => contactoEntity, contacto => contacto.ciudadRef)
    contactos: contactoEntity[];
}


