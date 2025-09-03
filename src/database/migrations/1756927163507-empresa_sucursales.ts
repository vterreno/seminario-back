import { MigrationInterface, QueryRunner } from "typeorm";

export class EmpresaSucursales1756927163507 implements MigrationInterface {
    name = 'EmpresaSucursales1756927163507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sucursal" DROP CONSTRAINT "FK_19079affa4f6853c2ba3641ed10"`);
        await queryRunner.query(`ALTER TABLE "sucursal" RENAME COLUMN "empresaId" TO "empresa_id"`);
        await queryRunner.query(`ALTER TABLE "sucursal" ADD CONSTRAINT "FK_c91767b4a90714f328e567bdcae" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sucursal" DROP CONSTRAINT "FK_c91767b4a90714f328e567bdcae"`);
        await queryRunner.query(`ALTER TABLE "sucursal" RENAME COLUMN "empresa_id" TO "empresaId"`);
        await queryRunner.query(`ALTER TABLE "sucursal" ADD CONSTRAINT "FK_19079affa4f6853c2ba3641ed10" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
