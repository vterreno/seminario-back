import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class Ubicaciones1757300000003 implements MigrationInterface {
    name = 'Ubicaciones1757300000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla provincias
        await queryRunner.createTable(
            new Table({
                name: "provincias",
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
                    }
                ]
            }),
            true
        );

        // Crear tabla ciudades
        await queryRunner.createTable(
            new Table({
                name: "ciudades",
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
                        name: "codigo_postal",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "provincia_id",
                        type: "int",
                        isNullable: false
                    }
                ]
            }),
            true
        );

        // Agregar foreign key de ciudades a provincias
        await queryRunner.createForeignKey(
            "ciudades",
            new TableForeignKey({
                name: "FK_ciudades_provincia",
                columnNames: ["provincia_id"],
                referencedTableName: "provincias",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        // Agregar columnas provincia_id y ciudad_id a contactos
        await queryRunner.addColumn(
            "contactos",
            new TableColumn({
                name: "provincia_id",
                type: "int",
                isNullable: true
            })
        );

        await queryRunner.addColumn(
            "contactos",
            new TableColumn({
                name: "ciudad_id",
                type: "int",
                isNullable: true
            })
        );

        // Agregar foreign keys de contactos a provincias y ciudades
        await queryRunner.createForeignKey(
            "contactos",
            new TableForeignKey({
                name: "FK_contactos_provincia",
                columnNames: ["provincia_id"],
                referencedTableName: "provincias",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL",
                onUpdate: "NO ACTION"
            })
        );

        await queryRunner.createForeignKey(
            "contactos",
            new TableForeignKey({
                name: "FK_contactos_ciudad",
                columnNames: ["ciudad_id"],
                referencedTableName: "ciudades",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign keys de contactos
        await queryRunner.dropForeignKey("contactos", "FK_contactos_ciudad");
        await queryRunner.dropForeignKey("contactos", "FK_contactos_provincia");

        // Eliminar columnas de contactos
        await queryRunner.dropColumn("contactos", "ciudad_id");
        await queryRunner.dropColumn("contactos", "provincia_id");

        // Eliminar foreign key de ciudades
        await queryRunner.dropForeignKey("ciudades", "FK_ciudades_provincia");

        // Eliminar tablas
        await queryRunner.dropTable("ciudades");
        await queryRunner.dropTable("provincias");
    }
}