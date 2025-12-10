import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from "typeorm";

export class CostoAdicionalIva1763469011648 implements MigrationInterface {
    name = 'CostoAdicionalIva1763469011648';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- Crear tabla costos-adicionales ---
        await queryRunner.createTable(
            new Table({
                name: "costos-adicionales",
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
                        name: "concepto",
                        type: "varchar",
                        length: "255",
                        isNullable: true
                    },
                    {
                        name: "monto",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: "compra_id",
                        type: "int",
                        isNullable: false
                    }
                ]
            }),
            true
        );

        // --- Agregar columnas IVA a detalle_compra ---
        await queryRunner.addColumns("detalle_compra", [
            new TableColumn({
                name: "iva_porcentaje",
                type: "decimal",
                precision: 5,
                scale: 2,
                default: 21,
                isNullable: false
            }),
            new TableColumn({
                name: "iva_monto",
                type: "decimal",
                precision: 10,
                scale: 2,
                default: 0,
                isNullable: false
            })
        ]);

        // --- Crear foreign key para costos-adicionales ---
        await queryRunner.createForeignKey(
            "costos-adicionales",
            new TableForeignKey({
                name: "FK_costos_adicionales_compra",
                columnNames: ["compra_id"],
                referencedTableName: "compras",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // --- Eliminar foreign key de costos-adicionales ---
        const costosAdicionalesTable = await queryRunner.getTable("costos-adicionales");
        const foreignKey = costosAdicionalesTable?.foreignKeys.find(
            fk => fk.columnNames.indexOf("compra_id") !== -1
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey("costos-adicionales", foreignKey);
        }

        // --- Eliminar columnas IVA de detalle_compra ---
        await queryRunner.dropColumn("detalle_compra", "iva_monto");
        await queryRunner.dropColumn("detalle_compra", "iva_porcentaje");

        // --- Eliminar tabla costos-adicionales ---
        await queryRunner.dropTable("costos-adicionales");
    }
}
