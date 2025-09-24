import { MigrationInterface, QueryRunner } from "typeorm";

export class Marca1758061494240 implements MigrationInterface {
    name = 'Marca1758061494240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sucursales" DROP CONSTRAINT "FK_c91767b4a90714f328e567bdcae"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_roles_empresa"`);
        await queryRunner.query(`ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_97cec863070ebbe3c9074f9ade7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97cec863070ebbe3c9074f9ade"`);
        await queryRunner.query(`CREATE TABLE "marcas" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying NOT NULL, "descripcion" character varying NOT NULL, "empresa_id" integer, "estado" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_0dabf9ed9a15bfb634cb675f7d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "sucursales_id_seq" OWNED BY "sucursales"."id"`);
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "id" SET DEFAULT nextval('"sucursales_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`CREATE INDEX "IDX_04295de30b7e92293a2e1a7c4b" ON "roles_permisos" ("permisos_id") `);
        await queryRunner.query(`ALTER TABLE "sucursales" ADD CONSTRAINT "FK_9da95c9691116c5c72fd56dee28" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "marcas" ADD CONSTRAINT "FK_34ae73140f8d19ec698063acd38" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_c878b09454f9b90ac189861bbdb" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_04295de30b7e92293a2e1a7c4b7" FOREIGN KEY ("permisos_id") REFERENCES "permisos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_04295de30b7e92293a2e1a7c4b7"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_c878b09454f9b90ac189861bbdb"`);
        await queryRunner.query(`ALTER TABLE "marcas" DROP CONSTRAINT "FK_34ae73140f8d19ec698063acd38"`);
        await queryRunner.query(`ALTER TABLE "sucursales" DROP CONSTRAINT "FK_9da95c9691116c5c72fd56dee28"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_04295de30b7e92293a2e1a7c4b"`);
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "id" SET DEFAULT nextval('sucursal_id_seq')`);
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "sucursales_id_seq"`);
        await queryRunner.query(`DROP TABLE "marcas"`);
        await queryRunner.query(`CREATE INDEX "IDX_97cec863070ebbe3c9074f9ade" ON "roles_permisos" ("permisos_id") `);
        await queryRunner.query(`ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_97cec863070ebbe3c9074f9ade7" FOREIGN KEY ("permisos_id") REFERENCES "permisos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_roles_empresa" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sucursales" ADD CONSTRAINT "FK_c91767b4a90714f328e567bdcae" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
