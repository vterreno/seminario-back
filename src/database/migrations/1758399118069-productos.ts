import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from "typeorm";

export class Productos1758399118069 implements MigrationInterface {
    name = 'Productos1758399118069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla productos
        await queryRunner.createTable(
            new Table({
                name: "productos",
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
                        name: "codigo",
                        type: "varchar",
                        isNullable: false,
                        isUnique: true
                    },
                    {
                        name: "empresa_id",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "marca_id",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "precio_costo",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: "precio_venta",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: "estado",
                        type: "boolean",
                        default: true,
                        isNullable: false
                    },
                    {
                        name: "stock_apertura",
                        type: "int",
                        default: 0,
                        isNullable: false
                    },
                    {
                        name: "stock",
                        type: "int",
                        default: 0,
                        isNullable: false
                    }
                ]
            }),
            true
        );

        // Manejo de secuencia
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "sucursales_id_seq" OWNED BY "sucursales"."id"`);
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "id" SET DEFAULT nextval('"sucursales_id_seq"')`);

        // Cambiar columna descripcion en marcas a nullable
        await queryRunner.changeColumn(
            "marcas",
            "descripcion",
            new TableColumn({
                name: "descripcion",
                type: "varchar",
                isNullable: true
            })
        );

        // Crear foreign keys
        await queryRunner.createForeignKey(
            "productos",
            new TableForeignKey({
                name: "FK_4697737382403af5c31644ad3ce",
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
                name: "FK_db0c18bdd5f379d40ae838e74bd",
                columnNames: ["marca_id"],
                referencedTableName: "marcas",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("productos", "FK_db0c18bdd5f379d40ae838e74bd");
        await queryRunner.dropForeignKey("productos", "FK_4697737382403af5c31644ad3ce");

        await queryRunner.changeColumn(
            "marcas",
            "descripcion",
            new TableColumn({
                name: "descripcion",
                type: "varchar",
                isNullable: false
            })
        );

        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "sucursales_id_seq"`);
        
        await queryRunner.dropTable("productos");
    }
}