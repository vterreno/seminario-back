import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmpresaIdToRoles1757286200000 implements MigrationInterface {
    name = 'AddEmpresaIdToRoles1757286200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add empresa_id column to roles table
        await queryRunner.query(`ALTER TABLE "roles" ADD "empresa_id" integer`);
        
        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_roles_empresa" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraint
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_roles_empresa"`);
        
        // Remove empresa_id column
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "empresa_id"`);
    }
}
