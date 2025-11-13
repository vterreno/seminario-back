import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class ListaPrecios1759688604002 implements MigrationInterface {
    name = 'ListaPrecios1759688604002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla lista_precios
        await queryRunner.createTable(
            new Table({
                name: "lista_precios",
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
                        isNullable: false,
                        isUnique: true
                    },
                    {
                        name: "descripcion",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "estado",
                        type: "boolean",
                        default: true
                    },
                    {
                        name: "empresa_id",
                        type: "int",
                        isNullable: true
                    }
                ]
            }),
            true
        );

        // Crear tabla producto_lista_precios (relación many-to-many)
        await queryRunner.createTable(
            new Table({
                name: "producto_lista_precios",
                columns: [
                    {
                        name: "producto_id",
                        type: "int",
                        isPrimary: true
                    },
                    {
                        name: "lista_precios_id",
                        type: "int",
                        isPrimary: true
                    },
                    {
                        name: "precio_venta_especifico",
                        type: "numeric",
                        precision: 10,
                        scale: 2,
                        isNullable: false
                    }
                ]
            }),
            true
        );

        // Crear índices
        await queryRunner.createIndex(
            "producto_lista_precios",
            new TableIndex({
                name: "IDX_bc9af6033b3462afefe9b1e294",
                columnNames: ["producto_id"]
            })
        );

        await queryRunner.createIndex(
            "producto_lista_precios",
            new TableIndex({
                name: "IDX_4ff0544939ce1c8797b0c85734",
                columnNames: ["lista_precios_id"]
            })
        );

        // Agregar unique constraint a permisos.codigo
        await queryRunner.query(`
            ALTER TABLE "permisos" 
            ADD CONSTRAINT "UQ_40d964f2742b2f4e3f379d3f460" 
            UNIQUE ("codigo")
        `);

        // Foreign Keys
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

        await queryRunner.createForeignKey(
            "lista_precios",
            new TableForeignKey({
                name: "FK_7cce1d60976b6d49a5ac4d3dff9",
                columnNames: ["empresa_id"],
                referencedTableName: "empresa",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const listaPreciosTable = await queryRunner.getTable("lista_precios");
        const productoListaPreciosTable = await queryRunner.getTable("producto_lista_precios");

        // Eliminar FKs de lista_precios
        const listaFK = listaPreciosTable?.foreignKeys.find(
            fk => fk.columnNames.indexOf("empresa_id") !== -1
        );
        if (listaFK) {
            await queryRunner.dropForeignKey("lista_precios", listaFK);
        }

        // Eliminar FKs de producto_lista_precios
        const productoListaFKs = productoListaPreciosTable?.foreignKeys || [];
        for (const fk of productoListaFKs) {
            await queryRunner.dropForeignKey("producto_lista_precios", fk);
        }

        await queryRunner.dropIndex("producto_lista_precios", "IDX_4ff0544939ce1c8797b0c85734");
        await queryRunner.dropIndex("producto_lista_precios", "IDX_bc9af6033b3462afefe9b1e294");
        
        await queryRunner.query(`
            ALTER TABLE "permisos" 
            DROP CONSTRAINT IF EXISTS "UQ_40d964f2742b2f4e3f379d3f460"
        `);

        await queryRunner.dropTable("producto_lista_precios");
        await queryRunner.dropTable("lista_precios");
    }
}