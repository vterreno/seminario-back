import { Logger } from "@nestjs/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756866505175 implements MigrationInterface {
    nombre = 'Init1756866505175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "permisos" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying NOT NULL, "codigo" character varying NOT NULL, CONSTRAINT "PK_3127bd9cfeb13ae76186d0d9b38" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying NOT NULL, "apellido" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "tenant_id" integer, "role_id" integer, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "usuarios" ("email") `);
        await queryRunner.query(`CREATE TABLE "roles_permisos" ("roles_id" integer NOT NULL, "permisos_id" integer NOT NULL, CONSTRAINT "PK_49f423993334fc34aceef2cfddb" PRIMARY KEY ("roles_id", "permisos_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0b47b66dfa525bf6858e60307a" ON "roles_permisos" ("roles_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c47b058e3ede4cd691d1c386ef" ON "roles_permisos" ("permisos_id") `);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_0b47b66dfa525bf6858e60307aa" FOREIGN KEY ("roles_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_c47b058e3ede4cd691d1c386ef6" FOREIGN KEY ("permisos_id") REFERENCES "permisos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_c47b058e3ede4cd691d1c386ef6"`);
        await queryRunner.query(`ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_0b47b66dfa525bf6858e60307aa"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_368e146b785b574f42ae9e53d5e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c47b058e3ede4cd691d1c386ef"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0b47b66dfa525bf6858e60307a"`);
        await queryRunner.query(`DROP TABLE "roles_permisos"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "permisos"`);
    }

}
