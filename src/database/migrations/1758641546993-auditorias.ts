import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Auditorias1758641546993 implements MigrationInterface {
    name = 'Auditorias1758641546993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear ENUM type (SQL puro, no hay soporte en Query Builder)
        await queryRunner.query(`CREATE TYPE "public"."movimiento-stock_tipo_movimiento_enum" AS ENUM('STOCK_APERTURA', 'VENTA', 'COMPRA', 'AJUSTE_MANUAL')`);

        // Crear tabla movimiento-stock
        await queryRunner.createTable(
            new Table({
                name: "movimiento-stock",
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
                        name: "fecha",
                        type: "timestamp",
                        isNullable: false
                    },
                    {
                        name: "tipo_movimiento",
                        type: "enum",
                        enum: ["STOCK_APERTURA", "VENTA", "COMPRA", "AJUSTE_MANUAL"],
                        isNullable: false
                    },
                    {
                        name: "descripcion",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "cantidad",
                        type: "int",
                        isNullable: false
                    },
                    {
                        name: "stock_resultante",
                        type: "int",
                        isNullable: false
                    },
                    {
                        name: "empresa_id",
                        type: "int",
                        isNullable: false
                    },
                    {
                        name: "producto_id",
                        type: "int",
                        isNullable: false
                    }
                ]
            }),
            true
        );

        // Crear foreign keys
        await queryRunner.createForeignKey(
            "movimiento-stock",
            new TableForeignKey({
                name: "FK_6ad1654ba8c7192ffb33fb23538",
                columnNames: ["empresa_id"],
                referencedTableName: "empresa",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        await queryRunner.createForeignKey(
            "movimiento-stock",
            new TableForeignKey({
                name: "FK_014700f8b783fad11b4a3e21533",
                columnNames: ["producto_id"],
                referencedTableName: "productos",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("movimiento-stock", "FK_014700f8b783fad11b4a3e21533");
        await queryRunner.dropForeignKey("movimiento-stock", "FK_6ad1654ba8c7192ffb33fb23538");
        await queryRunner.dropTable("movimiento-stock");
        await queryRunner.query(`DROP TYPE "public"."movimiento-stock_tipo_movimiento_enum"`);
    }
}