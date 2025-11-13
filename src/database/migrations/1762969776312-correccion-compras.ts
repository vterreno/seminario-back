import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from "typeorm";

export class CorreccionCompras1762969776312 implements MigrationInterface {
    name = 'CorreccionCompras1762969776312';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const productoListaPreciosTable = await queryRunner.getTable("producto_lista_precios");
        
        // --- Eliminar claves foráneas e índices ---
        const foreignKeys = productoListaPreciosTable?.foreignKeys || [];
        for (const fk of foreignKeys) {
            await queryRunner.dropForeignKey("producto_lista_precios", fk);
        }

        const indices = productoListaPreciosTable?.indices || [];
        for (const index of indices) {
            await queryRunner.dropIndex("producto_lista_precios", index);
        }

        // --- Ajustar columnas ---
        // Eliminar columnas existentes
        const columnsToDrop = ["id", "created_at", "updated_at", "deleted_at", "precio_venta_especifico"];
        for (const columnName of columnsToDrop) {
            const columnExists = productoListaPreciosTable?.columns.find(col => col.name === columnName);
            if (columnExists) {
                await queryRunner.dropColumn("producto_lista_precios", columnName);
            }
        }

        // Agregar columnas con la nueva estructura
        await queryRunner.addColumn("producto_lista_precios", 
            new TableColumn({
                name: "id",
                type: "serial",
                isNullable: false
            })
        );

        // Cambiar clave primaria temporalmente
        await queryRunner.dropPrimaryKey("producto_lista_precios");
        await queryRunner.createPrimaryKey("producto_lista_precios", ["producto_id", "lista_precios_id", "id"]);

        // Agregar columnas de timestamp
        await queryRunner.addColumns("producto_lista_precios", [
            new TableColumn({
                name: "created_at",
                type: "timestamp",
                default: "now()",
                isNullable: false
            }),
            new TableColumn({
                name: "updated_at",
                type: "timestamp",
                default: "now()",
                isNullable: false
            }),
            new TableColumn({
                name: "deleted_at",
                type: "timestamp",
                isNullable: true
            }),
            new TableColumn({
                name: "precio_venta_especifico",
                type: "numeric",
                precision: 10,
                scale: 2,
                default: 0,
                isNullable: false
            })
        ]);

        // Restaurar clave primaria original
        await queryRunner.dropPrimaryKey("producto_lista_precios");
        await queryRunner.createPrimaryKey("producto_lista_precios", ["producto_id", "lista_precios_id"]);

        // Actualizar enum de compras estado
        await queryRunner.query(`ALTER TYPE "public"."compras_estado_enum" RENAME TO "compras_estado_enum_old"`);
        
        await queryRunner.query(`
            UPDATE "compras"
            SET "estado" = 'PENDIENTE_PAGO'
            WHERE "estado" NOT IN ('PENDIENTE_PAGO', 'PAGADO');
        `);

        await queryRunner.query(`CREATE TYPE "public"."compras_estado_enum" AS ENUM('PENDIENTE_PAGO', 'PAGADO')`);
        
        await queryRunner.query(`ALTER TABLE "compras" ALTER COLUMN "estado" DROP DEFAULT`);
        
        await queryRunner.query(`
            ALTER TABLE "compras"
            ALTER COLUMN "estado"
            TYPE "public"."compras_estado_enum"
            USING "estado"::text::"public"."compras_estado_enum"
        `);
        
        await queryRunner.query(`ALTER TABLE "compras" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE_PAGO'`);
        await queryRunner.query(`DROP TYPE "public"."compras_estado_enum_old"`);

        // VERIFICAR Y CREAR ÍNDICES SOLO SI NO EXISTEN
        const productoIdIndexExists = productoListaPreciosTable?.indices.find(index => index.name === "IDX_bc9af6033b3462afefe9b1e294");
        if (!productoIdIndexExists) {
            await queryRunner.createIndex(
                "producto_lista_precios",
                new TableIndex({
                    name: "IDX_bc9af6033b3462afefe9b1e294",
                    columnNames: ["producto_id"]
                })
            );
        }

        const listaPreciosIdIndexExists = productoListaPreciosTable?.indices.find(index => index.name === "IDX_4ff0544939ce1c8797b0c85734");
        if (!listaPreciosIdIndexExists) {
            await queryRunner.createIndex(
                "producto_lista_precios",
                new TableIndex({
                    name: "IDX_4ff0544939ce1c8797b0c85734",
                    columnNames: ["lista_precios_id"]
                })
            );
        }

        // Crear foreign keys CON VERIFICACIÓN
        const productoFkExists = productoListaPreciosTable?.foreignKeys.find(fk => fk.name === "FK_bc9af6033b3462afefe9b1e2948");
        if (!productoFkExists) {
            await queryRunner.createForeignKey(
                "producto_lista_precios",
                new TableForeignKey({
                    name: "FK_bc9af6033b3462afefe9b1e2948",
                    columnNames: ["producto_id"],
                    referencedTableName: "productos",
                    referencedColumnNames: ["id"],
                    onDelete: "CASCADE",
                    onUpdate: "NO ACTION"
                })
            );
        }

        const listaPreciosFkExists = productoListaPreciosTable?.foreignKeys.find(fk => fk.name === "FK_4ff0544939ce1c8797b0c857344");
        if (!listaPreciosFkExists) {
            await queryRunner.createForeignKey(
                "producto_lista_precios",
                new TableForeignKey({
                    name: "FK_4ff0544939ce1c8797b0c857344",
                    columnNames: ["lista_precios_id"],
                    referencedTableName: "lista_precios",
                    referencedColumnNames: ["id"],
                    onDelete: "CASCADE",
                    onUpdate: "NO ACTION"
                })
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const productoListaPreciosTable = await queryRunner.getTable("producto_lista_precios");
        
        // Eliminar foreign keys
        const foreignKeys = productoListaPreciosTable?.foreignKeys || [];
        for (const fk of foreignKeys) {
            await queryRunner.dropForeignKey("producto_lista_precios", fk);
        }

        // Eliminar índices
        const indices = productoListaPreciosTable?.indices || [];
        for (const index of indices) {
            await queryRunner.dropIndex("producto_lista_precios", index);
        }

        // Revertir cambios en el enum
        await queryRunner.query(`CREATE TYPE "public"."compras_estado_enum_old" AS ENUM('PENDIENTE_PAGO', 'PAGADO', 'RECIBIDO', 'CANCELADO')`);
        await queryRunner.query(`ALTER TABLE "compras" ALTER COLUMN "estado" DROP DEFAULT`);
        await queryRunner.query(`
            ALTER TABLE "compras"
            ALTER COLUMN "estado"
            TYPE "public"."compras_estado_enum_old"
            USING "estado"::text::"public"."compras_estado_enum_old"
        `);
        await queryRunner.query(`ALTER TABLE "compras" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE_PAGO'`);
        await queryRunner.query(`DROP TYPE "public"."compras_estado_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."compras_estado_enum_old" RENAME TO "compras_estado_enum"`);

        // Revertir cambios en la estructura de producto_lista_precios
        await queryRunner.dropPrimaryKey("producto_lista_precios");
        await queryRunner.createPrimaryKey("producto_lista_precios", ["producto_id", "lista_precios_id", "id"]);

        // Eliminar columnas agregadas
        const columnsToDrop = ["precio_venta_especifico", "deleted_at", "updated_at", "created_at"];
        for (const columnName of columnsToDrop) {
            const columnExists = productoListaPreciosTable?.columns.find(col => col.name === columnName);
            if (columnExists) {
                await queryRunner.dropColumn("producto_lista_precios", columnName);
            }
        }

        // Eliminar columna id
        const idColumn = productoListaPreciosTable?.columns.find(col => col.name === "id");
        if (idColumn) {
            await queryRunner.dropColumn("producto_lista_precios", "id");
        }

        // Restaurar clave primaria original
        await queryRunner.dropPrimaryKey("producto_lista_precios");
        await queryRunner.createPrimaryKey("producto_lista_precios", ["producto_id", "lista_precios_id"]);

        // Agregar columnas originales
        await queryRunner.addColumns("producto_lista_precios", [
            new TableColumn({
                name: "precio_venta_especifico",
                type: "numeric",
                precision: 10,
                scale: 2,
                default: 0,
                isNullable: false
            }),
            new TableColumn({
                name: "deleted_at",
                type: "timestamp",
                isNullable: true
            }),
            new TableColumn({
                name: "updated_at",
                type: "timestamp",
                default: "now()",
                isNullable: false
            }),
            new TableColumn({
                name: "created_at",
                type: "timestamp",
                default: "now()",
                isNullable: false
            }),
            new TableColumn({
                name: "id",
                type: "serial",
                isNullable: false
            })
        ]);

        // Restaurar índices y foreign keys
        await queryRunner.createIndices("producto_lista_precios", [
            new TableIndex({
                name: "IDX_bc9af6033b3462afefe9b1e294",
                columnNames: ["producto_id"]
            }),
            new TableIndex({
                name: "IDX_4ff0544939ce1c8797b0c85734",
                columnNames: ["lista_precios_id"]
            })
        ]);

        await queryRunner.createForeignKeys("producto_lista_precios", [
            new TableForeignKey({
                name: "FK_bc9af6033b3462afefe9b1e2948",
                columnNames: ["producto_id"],
                referencedTableName: "productos",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
                onUpdate: "NO ACTION"
            }),
            new TableForeignKey({
                name: "FK_4ff0544939ce1c8797b0c857344",
                columnNames: ["lista_precios_id"],
                referencedTableName: "lista_precios",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
                onUpdate: "NO ACTION"
            })
        ]);
    }
}