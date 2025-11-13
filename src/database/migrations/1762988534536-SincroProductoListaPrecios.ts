import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from "typeorm";

export class SincroProductoListaPrecios1762988534536 implements MigrationInterface {
    name = 'SincroProductoListaPrecios1762988534536'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("producto_lista_precios");
        
        // Eliminar foreign keys existentes
        const foreignKeys = table?.foreignKeys || [];
        for (const fk of foreignKeys) {
            await queryRunner.dropForeignKey("producto_lista_precios", fk);
        }

        // Eliminar índices existentes
        const indices = table?.indices || [];
        for (const index of indices) {
            await queryRunner.dropIndex("producto_lista_precios", index);
        }

        // Eliminar y agregar columnas
        const idColumn = table?.columns.find(col => col.name === "id");
        if (idColumn) {
            await queryRunner.dropColumn("producto_lista_precios", "id");
        }

        const precioColumn = table?.columns.find(col => col.name === "precio_venta_especifico");
        if (precioColumn) {
            await queryRunner.dropColumn("producto_lista_precios", "precio_venta_especifico");
        }

        // VERIFICAR Y AGREGAR COLUMNAS DE TIMESTAMP SOLO SI NO EXISTEN
        const columnsToAdd = [];
        
        const createdAtExists = table?.columns.find(col => col.name === "created_at");
        if (!createdAtExists) {
            columnsToAdd.push(new TableColumn({
                name: "created_at",
                type: "timestamp",
                default: "now()",
                isNullable: false
            }));
        }

        const updatedAtExists = table?.columns.find(col => col.name === "updated_at");
        if (!updatedAtExists) {
            columnsToAdd.push(new TableColumn({
                name: "updated_at",
                type: "timestamp",
                default: "now()",
                isNullable: false
            }));
        }

        const deletedAtExists = table?.columns.find(col => col.name === "deleted_at");
        if (!deletedAtExists) {
            columnsToAdd.push(new TableColumn({
                name: "deleted_at",
                type: "timestamp",
                isNullable: true
            }));
        }

        // Agregar columnas solo si hay alguna por agregar
        if (columnsToAdd.length > 0) {
            await queryRunner.addColumns("producto_lista_precios", columnsToAdd);
        }

        // Agregar columna precio_venta_especifico solo si no existe
        const precioVentaExists = table?.columns.find(col => col.name === "precio_venta_especifico");
        if (!precioVentaExists) {
            await queryRunner.addColumn("producto_lista_precios",
                new TableColumn({
                    name: "precio_venta_especifico",
                    type: "numeric",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    isNullable: false
                })
            );
        }

        // VERIFICAR Y CREAR ÍNDICES SOLO SI NO EXISTEN
        const productoIdIndexExists = table?.indices.find(index => index.name === "IDX_bc9af6033b3462afefe9b1e294");
        if (!productoIdIndexExists) {
            await queryRunner.createIndex(
                "producto_lista_precios",
                new TableIndex({
                    name: "IDX_bc9af6033b3462afefe9b1e294",
                    columnNames: ["producto_id"]
                })
            );
        }

        const listaPreciosIdIndexExists = table?.indices.find(index => index.name === "IDX_4ff0544939ce1c8797b0c85734");
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
        const productoFkExists = table?.foreignKeys.find(fk => fk.name === "FK_bc9af6033b3462afefe9b1e2948");
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

        const listaPreciosFkExists = table?.foreignKeys.find(fk => fk.name === "FK_4ff0544939ce1c8797b0c857344");
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
        const table = await queryRunner.getTable("producto_lista_precios");
        
        // Eliminar foreign keys
        const foreignKeys = table?.foreignKeys || [];
        for (const fk of foreignKeys) {
            await queryRunner.dropForeignKey("producto_lista_precios", fk);
        }

        // Eliminar índices
        const indices = table?.indices || [];
        for (const index of indices) {
            await queryRunner.dropIndex("producto_lista_precios", index);
        }

        // Eliminar columnas agregadas
        const columnsToDrop = ["precio_venta_especifico", "deleted_at", "updated_at", "created_at"];
        for (const columnName of columnsToDrop) {
            const columnExists = table?.columns.find(col => col.name === columnName);
            if (columnExists) {
                await queryRunner.dropColumn("producto_lista_precios", columnName);
            }
        }

        // Restaurar estructura original
        // Agregar columna id si fue eliminada
        const idColumnExists = table?.columns.find(col => col.name === "id");
        if (!idColumnExists) {
            await queryRunner.addColumn("producto_lista_precios",
                new TableColumn({
                    name: "id",
                    type: "serial",
                    isNullable: false
                })
            );
        }

        // Restaurar índices y foreign keys originales si es necesario
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