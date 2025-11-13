import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEstadoColumnToRoles1757292200000 implements MigrationInterface {
    name = 'AddEstadoColumnToRoles1757292200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna estado a la tabla roles
        await queryRunner.addColumn(
            "roles",
            new TableColumn({
                name: "estado",
                type: "boolean",
                isNullable: false,
                default: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columna estado de la tabla roles
        await queryRunner.dropColumn("roles", "estado");
    }
}