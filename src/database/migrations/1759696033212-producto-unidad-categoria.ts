import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class ProductoUnidadCategoria1759696033212 implements MigrationInterface {
    name = 'ProductoUnidadCategoria1759696033212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "productos",
            new TableColumn({
                name: "categoria_id",
                type: "int",
                isNullable: true
            })
        );

        await queryRunner.createForeignKey(
            "productos",
            new TableForeignKey({
                name: "FK_5aaee6054b643e7c778477193a3",
                columnNames: ["categoria_id"],
                referencedTableName: "categorias",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("productos", "FK_5aaee6054b643e7c778477193a3");
        await queryRunner.dropColumn("productos", "categoria_id");
    }
}