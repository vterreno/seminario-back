import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEstadoColumnToRoles1757292200000 implements MigrationInterface {
    name = 'AddEstadoColumnToRoles1757292200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add estado column to roles table
        await queryRunner.query(`ALTER TABLE "roles" ADD "estado" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove estado column from roles table
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "estado"`);
    }
}
