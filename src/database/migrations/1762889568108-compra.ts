import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from "typeorm";

export class Compra1762889568108 implements MigrationInterface {
    name = 'Compra1762889568108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla producto_proveedor
        await queryRunner.createTable(
            new Table({
                name: "producto_proveedor",
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
                        name: "producto_id",
                        type: "int",
                        isNullable: false
                    },
                    {
                        name: "proveedor_id",
                        type: "int",
                        isNullable: false
                    },
                    {
                        name: "precio_proveedor",
                        type: "numeric",
                        precision: 10,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: "codigo_proveedor",
                        type: "varchar",
                        isNullable: true
                    }
                ]
            }),
            true
        );

        // Crear tabla detalle_compra
        await queryRunner.createTable(
            new Table({
                name: "detalle_compra",
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
                        name: "producto_proveedor_id",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "compra_id",
                        type: "int",
                        isNullable: true
                    }
                ]
            }),
            true
        );

        // Crear ENUM para estado de compras (solo si no existe)
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "compras_estado_enum" AS ENUM(
                    'PENDIENTE_PAGO', 
                    'PAGADO', 
                    'RECIBIDO', 
                    'CANCELADO'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Crear tabla compras
        await queryRunner.createTable(
            new Table({
                name: "compras",
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
                        name: "numero_compra",
                        type: "int",
                        isNullable: false
                    },
                    {
                        name: "fecha_compra",
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
                        name: "estado",
                        type: "enum",
                        enum: ["PENDIENTE_PAGO", "PAGADO", "RECIBIDO", "CANCELADO"],
                        default: "'PENDIENTE_PAGO'"
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
                    }
                ]
            }),
            true
        );

        // Recrear índices de usuarios_sucursales con nuevos nombres
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_usuarios_sucursales_usuario_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_usuarios_sucursales_sucursal_id"`);

        await queryRunner.createIndex(
            "usuarios_sucursales",
            new TableIndex({
                name: "IDX_0eae05ece551fd97f184283281",
                columnNames: ["usuario_id"]
            })
        );

        await queryRunner.createIndex(
            "usuarios_sucursales",
            new TableIndex({
                name: "IDX_6c54354fd145c10062f98b1581",
                columnNames: ["sucursal_id"]
            })
        );

        // Foreign Keys producto_proveedor
        await queryRunner.createForeignKey(
            "producto_proveedor",
            new TableForeignKey({
                name: "FK_7587673df9ed2964d7fa4a24124",
                columnNames: ["producto_id"],
                referencedTableName: "productos",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
                onUpdate: "NO ACTION"
            })
        );

        await queryRunner.createForeignKey(
            "producto_proveedor",
            new TableForeignKey({
                name: "FK_9e66fbc60135bb0a2b5d45cbb4f",
                columnNames: ["proveedor_id"],
                referencedTableName: "contactos",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
                onUpdate: "NO ACTION"
            })
        );

        // Foreign Keys detalle_compra
        await queryRunner.createForeignKey(
            "detalle_compra",
            new TableForeignKey({
                name: "FK_bc15e628e458709b3cdcd5fb254",
                columnNames: ["producto_proveedor_id"],
                referencedTableName: "producto_proveedor",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        await queryRunner.createForeignKey(
            "detalle_compra",
            new TableForeignKey({
                name: "FK_a55bfe2df79c68ba54b0bfbd331",
                columnNames: ["compra_id"],
                referencedTableName: "compras",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        // Foreign Keys compras
        await queryRunner.createForeignKey(
            "compras",
            new TableForeignKey({
                name: "FK_b7b22a54d4d4ae571ae8a2baca3",
                columnNames: ["contacto_id"],
                referencedTableName: "contactos",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        await queryRunner.createForeignKey(
            "compras",
            new TableForeignKey({
                name: "FK_a7d0e71af5f2dd38d5f2f3855f3",
                columnNames: ["sucursal_id"],
                referencedTableName: "sucursales",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const comprasTable = await queryRunner.getTable("compras");
        const detalleCompraTable = await queryRunner.getTable("detalle_compra");
        const productoProveedorTable = await queryRunner.getTable("producto_proveedor");

        // Eliminar FKs de compras
        const comprasFKs = comprasTable?.foreignKeys || [];
        for (const fk of comprasFKs) {
            await queryRunner.dropForeignKey("compras", fk);
        }

        // Eliminar FKs de detalle_compra
        const detalleCompraFKs = detalleCompraTable?.foreignKeys || [];
        for (const fk of detalleCompraFKs) {
            await queryRunner.dropForeignKey("detalle_compra", fk);
        }

        // Eliminar FKs de producto_proveedor
        const productoProveedorFKs = productoProveedorTable?.foreignKeys || [];
        for (const fk of productoProveedorFKs) {
            await queryRunner.dropForeignKey("producto_proveedor", fk);
        }

        await queryRunner.dropIndex("usuarios_sucursales", "IDX_6c54354fd145c10062f98b1581");
        await queryRunner.dropIndex("usuarios_sucursales", "IDX_0eae05ece551fd97f184283281");

        // Recrear índices antiguos
        await queryRunner.createIndex(
            "usuarios_sucursales",
            new TableIndex({
                name: "IDX_usuarios_sucursales_sucursal_id",
                columnNames: ["sucursal_id"]
            })
        );

        await queryRunner.createIndex(
            "usuarios_sucursales",
            new TableIndex({
                name: "IDX_usuarios_sucursales_usuario_id",
                columnNames: ["usuario_id"]
            })
        );

        await queryRunner.dropTable("compras");
        await queryRunner.query(`DROP TYPE "compras_estado_enum"`);
        await queryRunner.dropTable("detalle_compra");
        await queryRunner.dropTable("producto_proveedor");
    }
}