import { MigrationInterface, QueryRunner } from "typeorm";

export class Productos1758399118069 implements MigrationInterface {
    name = 'Productos1758399118069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "productos" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying NOT NULL, "codigo" character varying NOT NULL, "empresa_id" integer, "marca_id" integer, "precio_costo" numeric(10,2) NOT NULL, "precio_venta" numeric(10,2) NOT NULL, "estado" boolean NOT NULL DEFAULT true, "stock_apertura" integer NOT NULL DEFAULT '0', "stock" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_2da210b34325c2319d784a32d49" UNIQUE ("codigo"), CONSTRAINT "PK_04f604609a0949a7f3b43400766" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "sucursales_id_seq" OWNED BY "sucursales"."id"`);
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "id" SET DEFAULT nextval('"sucursales_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "marcas" ALTER COLUMN "descripcion" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_4697737382403af5c31644ad3ce" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_db0c18bdd5f379d40ae838e74bd" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_db0c18bdd5f379d40ae838e74bd"`);
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_4697737382403af5c31644ad3ce"`);
        await queryRunner.query(`ALTER TABLE "marcas" ALTER COLUMN "descripcion" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "sucursales_id_seq"`);
        await queryRunner.query(`DROP TABLE "productos"`);
    }

}
