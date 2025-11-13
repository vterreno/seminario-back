import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEsEmpresaContactos1757300000002 implements MigrationInterface {
    name = 'AddEsEmpresaContactos1757300000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna es_empresa
        await queryRunner.addColumn(
            "contactos",
            new TableColumn({
                name: "es_empresa",
                type: "boolean",
                isNullable: false,
                default: false
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columna es_empresa
        await queryRunner.dropColumn("contactos", "es_empresa");
    }
}