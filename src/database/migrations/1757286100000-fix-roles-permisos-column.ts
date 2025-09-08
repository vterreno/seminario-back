import { MigrationInterface, QueryRunner } from "typeorm";

export class FixRolesPermisosColumn1757286100000 implements MigrationInterface {
    name = 'FixRolesPermisosColumn1757286100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename permisosId column to permisos_id in roles_permisos table
        await queryRunner.query(`ALTER TABLE "roles_permisos" RENAME COLUMN "permisosId" TO "permisos_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the column name change
        await queryRunner.query(`ALTER TABLE "roles_permisos" RENAME COLUMN "permisos_id" TO "permisosId"`);
    }
}
