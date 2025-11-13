import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddStatusToUsers1757385600000 implements MigrationInterface {
    name = 'AddStatusToUsers1757385600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna status a la tabla usuarios
        await queryRunner.addColumn(
            "usuarios",
            new TableColumn({
                name: "status",
                type: "boolean",
                isNullable: false,
                default: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columna status de la tabla usuarios
        await queryRunner.dropColumn("usuarios", "status");
    }
}