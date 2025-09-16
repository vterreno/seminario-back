import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ciudadEntity } from "./ciudad.entity";

@Entity('provincias')
export class provinciaEntity extends BaseEntity {
    @Column()
    nombre: string;

    @OneToMany(() => ciudadEntity, ciudad => ciudad.provincia)
    ciudades: ciudadEntity[];
}


