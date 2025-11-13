import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class Init1757093192960 implements MigrationInterface {
    name = 'Init1757093192960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla permisos
        await queryRunner.createTable(
            new Table({
                name: "permisos",
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
                        isNullable: false
                    }
                ]
            }),
            true
        );

        // Crear tabla roles
        await queryRunner.createTable(
            new Table({
                name: "roles",
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

        // Crear tabla sucursal
        await queryRunner.createTable(
            new Table({
                name: "sucursal",
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
                        name: "name",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "codigo_sucursal",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "direccion",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "estado",
                        type: "boolean",
                        default: true,
                        isNullable: false
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

        // Crear tabla empresa
        await queryRunner.createTable(
            new Table({
                name: "empresa",
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
                        name: "name",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "estado",
                        type: "boolean",
                        default: true,
                        isNullable: false
                    }
                ]
            }),
            true
        );

        // Crear tabla usuarios
        await queryRunner.createTable(
            new Table({
                name: "usuarios",
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
                        name: "apellido",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "password",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "role_id",
                        type: "int",
                        isNullable: true
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

        // Crear índice único en usuarios.email
        await queryRunner.createIndex(
            "usuarios",
            new TableIndex({
                name: "IDX_446adfc18b35418aac32ae0b7b",
                columnNames: ["email"],
                isUnique: true
            })
        );

        // Crear tabla roles_permisos (many-to-many)
        await queryRunner.createTable(
            new Table({
                name: "roles_permisos",
                columns: [
                    {
                        name: "roles_id",
                        type: "int",
                        isPrimary: true,
                        isNullable: false
                    },
                    {
                        name: "permisosId",
                        type: "int",
                        isPrimary: true,
                        isNullable: false
                    }
                ]
            }),
            true
        );

        // Crear índices en roles_permisos
        await queryRunner.createIndex(
            "roles_permisos",
            new TableIndex({
                name: "IDX_c0a28803cfdca96c48eda330a4",
                columnNames: ["roles_id"]
            })
        );

        await queryRunner.createIndex(
            "roles_permisos",
            new TableIndex({
                name: "IDX_97cec863070ebbe3c9074f9ade",
                columnNames: ["permisosId"]
            })
        );

        // Crear foreign keys
        await queryRunner.createForeignKey(
            "sucursal",
            new TableForeignKey({
                name: "FK_c91767b4a90714f328e567bdcae",
                columnNames: ["empresa_id"],
                referencedTableName: "empresa",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        await queryRunner.createForeignKey(
            "usuarios",
            new TableForeignKey({
                name: "FK_933f1f766daaa16d3848d186a59",
                columnNames: ["role_id"],
                referencedTableName: "roles",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        await queryRunner.createForeignKey(
            "usuarios",
            new TableForeignKey({
                name: "FK_f7a79f991bd7319aef158bfbd38",
                columnNames: ["empresa_id"],
                referencedTableName: "empresa",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );

        await queryRunner.createForeignKey(
            "roles_permisos",
            new TableForeignKey({
                name: "FK_c0a28803cfdca96c48eda330a44",
                columnNames: ["roles_id"],
                referencedTableName: "roles",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            })
        );

        await queryRunner.createForeignKey(
            "roles_permisos",
            new TableForeignKey({
                name: "FK_97cec863070ebbe3c9074f9ade7",
                columnNames: ["permisosId"],
                referencedTableName: "permisos",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign keys
        await queryRunner.dropForeignKey("roles_permisos", "FK_97cec863070ebbe3c9074f9ade7");
        await queryRunner.dropForeignKey("roles_permisos", "FK_c0a28803cfdca96c48eda330a44");
        await queryRunner.dropForeignKey("usuarios", "FK_f7a79f991bd7319aef158bfbd38");
        await queryRunner.dropForeignKey("usuarios", "FK_933f1f766daaa16d3848d186a59");
        await queryRunner.dropForeignKey("sucursal", "FK_c91767b4a90714f328e567bdcae");

        // Eliminar índices
        await queryRunner.dropIndex("roles_permisos", "IDX_97cec863070ebbe3c9074f9ade");
        await queryRunner.dropIndex("roles_permisos", "IDX_c0a28803cfdca96c48eda330a4");
        await queryRunner.dropTable("roles_permisos");

        await queryRunner.dropIndex("usuarios", "IDX_446adfc18b35418aac32ae0b7b");

        // Eliminar tablas
        await queryRunner.dropTable("usuarios");
        await queryRunner.dropTable("empresa");
        await queryRunner.dropTable("sucursal");
        await queryRunner.dropTable("roles");
        await queryRunner.dropTable("permisos");
    }
}