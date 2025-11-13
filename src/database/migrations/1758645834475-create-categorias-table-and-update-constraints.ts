import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCategoriasTableAndUpdateConstraints1758645834475 implements MigrationInterface {
    name = 'CreateCategoriasTableAndUpdateConstraints1758645834475'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "categorias",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false
                    },
                    {
                        name: "deleted_at",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "nombre",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "descripcion",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "estado",
                        type: "boolean",
                        default: true,
                        isNullable: false
                    },
                    {
                        name: "empresa_id",
                        type: "int",
                        isNullable: true
                    }
                ],
                uniques: [
                    {
                        name: "UQ_692c9aed167a494d2205382ebb5",
                        columnNames: ["nombre", "empresa_id"]
                    }
                ]
            }),
            true
        );

        await queryRunner.createForeignKey(
            "categorias",
            new TableForeignKey({
                name: "FK_f4653d9281a77dc8918ab07c31c",
                columnNames: ["empresa_id"],
                referencedTableName: "empresa",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("categorias", "FK_f4653d9281a77dc8918ab07c31c");
        await queryRunner.dropTable("categorias");
    }
}