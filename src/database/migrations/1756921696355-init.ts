import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756921696355 implements MigrationInterface {
    name = 'Init1756921696355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sucursal" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "codigo_sucursal" character varying NOT NULL, "direccion" character varying NOT NULL, "empresaId" integer, CONSTRAINT "PK_a3817e81fd6972dd2172d9c4e60" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "empresa" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, CONSTRAINT "PK_bee78e8f1760ccf9cff402118a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying NOT NULL, "apellido" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "tenant_id" integer, "role_id" integer, CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_446adfc18b35418aac32ae0b7b" ON "usuarios" ("email") `);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permisos" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying NOT NULL, "codigo" character varying NOT NULL, CONSTRAINT "PK_3127bd9cfeb13ae76186d0d9b38" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles_permisos" ("roles_id" integer NOT NULL, "permisosId" integer NOT NULL, CONSTRAINT "PK_89f8b3283587858b4491e0ca000" PRIMARY KEY ("roles_id", "permisosId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c0a28803cfdca96c48eda330a4" ON "roles_permisos" ("roles_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_97cec863070ebbe3c9074f9ade" ON "roles_permisos" ("permisosId") `);
        await queryRunner.query(`ALTER TABLE "sucursal" ADD CONSTRAINT "FK_19079affa4f6853c2ba3641ed10" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_933f1f766daaa16d3848d186a59" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_c0a28803cfdca96c48eda330a44" FOREIGN KEY ("roles_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_97cec863070ebbe3c9074f9ade7" FOREIGN KEY ("permisosId") REFERENCES "permisos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_97cec863070ebbe3c9074f9ade7"`);
        await queryRunner.query(`ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_c0a28803cfdca96c48eda330a44"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_933f1f766daaa16d3848d186a59"`);
        await queryRunner.query(`ALTER TABLE "sucursal" DROP CONSTRAINT "FK_19079affa4f6853c2ba3641ed10"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97cec863070ebbe3c9074f9ade"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c0a28803cfdca96c48eda330a4"`);
        await queryRunner.query(`DROP TABLE "roles_permisos"`);
        await queryRunner.query(`DROP TABLE "permisos"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_446adfc18b35418aac32ae0b7b"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "empresa"`);
        await queryRunner.query(`DROP TABLE "sucursal"`);
    }

}
