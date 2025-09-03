import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756855574602 implements MigrationInterface {
    name = 'Init1756855574602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastname"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "nombre" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "apellido" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "tenant_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tenant_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "apellido"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nombre"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastname" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying NOT NULL`);
    }

}
