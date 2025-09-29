import { MigrationInterface, QueryRunner } from "typeorm";

export class Contactos1757300000000 implements MigrationInterface {
    name = 'Contactos1757300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "contactos" (
            "id" SERIAL NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            "nombre_razon_social" character varying NOT NULL,
            "tipo_identificacion" character varying,
            "numero_identificacion" character varying,
            "condicion_iva" character varying,
            "email" character varying,
            "telefono_movil" character varying,
            "direccion_calle" character varying,
            "direccion_numero" character varying,
            "direccion_piso_dpto" character varying,
            "ciudad" character varying,
            "provincia" character varying,
            "codigo_postal" character varying,
            "estado" boolean NOT NULL DEFAULT true,
            "rol" character varying NOT NULL DEFAULT 'cliente',
            "es_consumidor_final" boolean NOT NULL DEFAULT false,
            "empresa_id" integer,
            CONSTRAINT "PK_contactos_id" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_empresa" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Unique by empresa_id + tipo_identificacion + numero_identificacion, but only when tipo y numero no son nulos
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_contactos_identificacion" ON "contactos" ("empresa_id", "tipo_identificacion", "numero_identificacion") WHERE "tipo_identificacion" IS NOT NULL AND "numero_identificacion" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_contactos_identificacion"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_contactos_empresa"`);
        await queryRunner.query(`DROP TABLE "contactos"`);
    }
}


