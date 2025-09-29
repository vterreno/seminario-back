import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEsEmpresaContactos1757300000002 implements MigrationInterface {
    name = 'AddEsEmpresaContactos1757300000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contactos" ADD COLUMN "es_empresa" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contactos" DROP COLUMN "es_empresa"`);
    }
}


