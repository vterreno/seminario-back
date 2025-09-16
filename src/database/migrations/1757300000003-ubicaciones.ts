import { MigrationInterface, QueryRunner } from "typeorm";

export class Ubicaciones1757300000003 implements MigrationInterface {
    name = 'Ubicaciones1757300000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "provincias" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying NOT NULL, CONSTRAINT "PK_provincias_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ciudades" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying NOT NULL, "codigo_postal" character varying NOT NULL, "provincia_id" integer NOT NULL, CONSTRAINT "PK_ciudades_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ciudades" ADD CONSTRAINT "FK_ciudades_provincia" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD COLUMN "provincia_id" integer`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD COLUMN "ciudad_id" integer`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_provincia" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_ciudad" FOREIGN KEY ("ciudad_id") REFERENCES "ciudades"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_contactos_ciudad"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_contactos_provincia"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP COLUMN "ciudad_id"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP COLUMN "provincia_id"`);
        await queryRunner.query(`ALTER TABLE "ciudades" DROP CONSTRAINT "FK_ciudades_provincia"`);
        await queryRunner.query(`DROP TABLE "ciudades"`);
        await queryRunner.query(`DROP TABLE "provincias"`);
    }
}


