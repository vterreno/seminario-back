import { MigrationInterface, QueryRunner } from "typeorm";

export class FixRolesPermisosColumn1757286100000 implements MigrationInterface {
    name = 'FixRolesPermisosColumn1757286100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Renombrar columna permisosId a permisos_id
        await queryRunner.renameColumn("roles_permisos", "permisosId", "permisos_id");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir el cambio de nombre
        await queryRunner.renameColumn("roles_permisos", "permisos_id", "permisosId");
    }
}