import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from "typeorm";

// 1. Migración de Ventas
export class Ventas1759772802398 implements MigrationInterface {
    name = 'Ventas1759772802398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla pagos
        await queryRunner.createTable(
            new Table({
                name: "pagos",
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
                        name: "fecha_pago",
                        type: "timestamp",
                        isNullable: false
                    },
                    {
                        name: "monto_pago",
                        type: "numeric",
                        precision: 10,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: "metodo_pago",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "sucursal_id",
                        type: "int",
                        isNullable: true
                    }
                ]
            }),
            true
        );

        // Crear tabla detalle_venta
        await queryRunner.createTable(
            new Table({
                name: "detalle_venta",
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
                        name: "cantidad",
                        type: "int",
                        isNullable: false
                    },
                    {
                        name: "precio_unitario",
                        type: "numeric",
                        precision: 10,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: "subtotal",
                        type: "numeric",
                        precision: 10,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: "producto_id",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "venta_id",
                        type: "int",
                        isNullable: true
                    }
                ]
            }),
            true
        );

        // Crear tabla ventas
        await queryRunner.createTable(
            new Table({
                name: "ventas",
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
                        name: "numero_venta",
                        type: "int",
                        isNullable: false
                    },
                    {
                        name: "fecha_venta",
                        type: "timestamp",
                        isNullable: false
                    },
                    {
                        name: "monto_total",
                        type: "numeric",
                        precision: 10,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: "contacto_id",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "sucursal_id",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "pago_id",
                        type: "int",
                        isNullable: true,
                        isUnique: true
                    }
                ]
            }),
            true
        );

        // Agregar numero_venta a sucursales
        await queryRunner.addColumn(
            "sucursales",
            new TableColumn({
                name: "numero_venta",
                type: "int",
                isNullable: false,
                default: 0
            })
        );

        // Foreign Key: pagos -> sucursales
        await queryRunner.createForeignKey(
            "pagos",
            new TableForeignKey({
                columnNames: ["sucursal_id"],
                referencedTableName: "sucursales",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        // Foreign Key: detalle_venta -> productos
        await queryRunner.createForeignKey(
            "detalle_venta",
            new TableForeignKey({
                columnNames: ["producto_id"],
                referencedTableName: "productos",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        // Foreign Key: detalle_venta -> ventas
        await queryRunner.createForeignKey(
            "detalle_venta",
            new TableForeignKey({
                columnNames: ["venta_id"],
                referencedTableName: "ventas",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        // Foreign Key: ventas -> contactos
        await queryRunner.createForeignKey(
            "ventas",
            new TableForeignKey({
                columnNames: ["contacto_id"],
                referencedTableName: "contactos",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        // Foreign Key: ventas -> sucursales
        await queryRunner.createForeignKey(
            "ventas",
            new TableForeignKey({
                columnNames: ["sucursal_id"],
                referencedTableName: "sucursales",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        // Foreign Key: ventas -> pagos
        await queryRunner.createForeignKey(
            "ventas",
            new TableForeignKey({
                columnNames: ["pago_id"],
                referencedTableName: "pagos",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const ventasTable = await queryRunner.getTable("ventas");
        const detalleVentaTable = await queryRunner.getTable("detalle_venta");
        const pagosTable = await queryRunner.getTable("pagos");

        // Eliminar FKs de ventas
        const ventasForeignKeys = ventasTable?.foreignKeys.filter(
            fk => fk.columnNames.indexOf("contacto_id") !== -1 ||
                  fk.columnNames.indexOf("sucursal_id") !== -1 ||
                  fk.columnNames.indexOf("pago_id") !== -1
        );
        for (const fk of ventasForeignKeys || []) {
            await queryRunner.dropForeignKey("ventas", fk);
        }

        // Eliminar FKs de detalle_venta
        const detalleVentaForeignKeys = detalleVentaTable?.foreignKeys.filter(
            fk => fk.columnNames.indexOf("producto_id") !== -1 ||
                  fk.columnNames.indexOf("venta_id") !== -1
        );
        for (const fk of detalleVentaForeignKeys || []) {
            await queryRunner.dropForeignKey("detalle_venta", fk);
        }

        // Eliminar FKs de pagos
        const pagosForeignKeys = pagosTable?.foreignKeys.filter(
            fk => fk.columnNames.indexOf("sucursal_id") !== -1
        );
        for (const fk of pagosForeignKeys || []) {
            await queryRunner.dropForeignKey("pagos", fk);
        }

        await queryRunner.dropColumn("sucursales", "numero_venta");
        await queryRunner.dropTable("ventas");
        await queryRunner.dropTable("detalle_venta");
        await queryRunner.dropTable("pagos");
    }
}

