import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from "typeorm";

// 1. Migración UnidadMedida - Simplificada
export class UnidadMedida1759509866492 implements MigrationInterface {
    name = 'UnidadMedida1759509866492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla unidades_medida
        await queryRunner.createTable(
            new Table({
                name: "unidades_medida",
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
                        default: "now()"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "deleted_at",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "nombre",
                        type: "varchar",
                        length: "50",
                        isNullable: false
                    },
                    {
                        name: "abreviatura",
                        type: "varchar",
                        length: "10",
                        isNullable: false
                    },
                    {
                        name: "acepta_decimales",
                        type: "boolean",
                        default: false
                    },
                    {
                        name: "empresa_id",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "estado",
                        type: "boolean",
                        default: true
                    }
                ]
            }),
            true
        );

        // Crear índices únicos compuestos
        await queryRunner.createIndex(
            "unidades_medida",
            new TableIndex({
                name: "IDX_842a2d613bb95917252ef186a2",
                columnNames: ["abreviatura", "empresa_id"],
                isUnique: true
            })
        );

        await queryRunner.createIndex(
            "unidades_medida",
            new TableIndex({
                name: "IDX_a9b659026f7f0a140111a57bb5",
                columnNames: ["nombre", "empresa_id"],
                isUnique: true
            })
        );

        // Agregar columna unidad_medida_id a productos
        await queryRunner.addColumn(
            "productos",
            new TableColumn({
                name: "unidad_medida_id",
                type: "int",
                isNullable: true
            })
        );

        // Foreign Keys
        await queryRunner.createForeignKey(
            "unidades_medida",
            new TableForeignKey({
                name: "FK_3e76b73ba043e1cb531b8a4cec8",
                columnNames: ["empresa_id"],
                referencedTableName: "empresa",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        await queryRunner.createForeignKey(
            "productos",
            new TableForeignKey({
                name: "FK_d9d573eddc1e6de0f2ded4fd888",
                columnNames: ["unidad_medida_id"],
                referencedTableName: "unidades_medida",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const productosTable = await queryRunner.getTable("productos");
        const unidadesMedidaTable = await queryRunner.getTable("unidades_medida");

        // Eliminar FK de productos
        const productoFK = productosTable?.foreignKeys.find(
            fk => fk.columnNames.indexOf("unidad_medida_id") !== -1
        );
        if (productoFK) {
            await queryRunner.dropForeignKey("productos", productoFK);
        }

        // Eliminar FK de unidades_medida
        const unidadFK = unidadesMedidaTable?.foreignKeys.find(
            fk => fk.columnNames.indexOf("empresa_id") !== -1
        );
        if (unidadFK) {
            await queryRunner.dropForeignKey("unidades_medida", unidadFK);
        }

        await queryRunner.dropColumn("productos", "unidad_medida_id");
        await queryRunner.dropIndex("unidades_medida", "IDX_a9b659026f7f0a140111a57bb5");
        await queryRunner.dropIndex("unidades_medida", "IDX_842a2d613bb95917252ef186a2");
        await queryRunner.dropTable("unidades_medida");
    }
}