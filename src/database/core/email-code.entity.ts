import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity("email-code")
export class emailCodeEntity extends BaseEntity{
    @Column()
    expired_at: Date
    @Column()
    codigoHash: string
    @Column()
    email: string
}