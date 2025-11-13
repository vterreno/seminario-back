import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddEmpresaIdToRoles1757286200000 implements MigrationInterface {
    name = 'AddEmpresaIdToRoles1757286200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna empresa_id a la tabla roles
        await queryRunner.addColumn(
            "roles",
            new TableColumn({
                name: "empresa_id",
                type: "int",
                isNullable: true
            })
        );
        
        // Agregar foreign key constraint
        await queryRunner.createForeignKey(
            "roles",
            new TableForeignKey({
                name: "FK_roles_empresa",
                columnNames: ["empresa_id"],
                referencedTableName: "empresa",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign key constraint
        await queryRunner.dropForeignKey("roles", "FK_roles_empresa");
        
        // Eliminar columna empresa_id
        await queryRunner.dropColumn("roles", "empresa_id");
    }
}