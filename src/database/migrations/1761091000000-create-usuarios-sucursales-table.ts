import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateUsuariosSucursalesTable1761091000000 implements MigrationInterface {
    name = 'CreateUsuariosSucursalesTable1761091000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla de relación many-to-many
        await queryRunner.createTable(
            new Table({
                name: "usuarios_sucursales",
                columns: [
                    {
                        name: "usuario_id",
                        type: "int",
                        isPrimary: true
                    },
                    {
                        name: "sucursal_id",
                        type: "int",
                        isPrimary: true
                    }
                ]
            }),
            true
        );

        // Crear índices
        await queryRunner.createIndex(
            "usuarios_sucursales",
            new TableIndex({
                name: "IDX_usuarios_sucursales_usuario_id",
                columnNames: ["usuario_id"]
            })
        );

        await queryRunner.createIndex(
            "usuarios_sucursales",
            new TableIndex({
                name: "IDX_usuarios_sucursales_sucursal_id",
                columnNames: ["sucursal_id"]
            })
        );

        // Foreign Key: usuarios_sucursales -> usuarios
        await queryRunner.createForeignKey(
            "usuarios_sucursales",
            new TableForeignKey({
                name: "FK_usuarios_sucursales_usuario",
                columnNames: ["usuario_id"],
                referencedTableName: "usuarios",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
                onUpdate: "NO ACTION"
            })
        );

        // Foreign Key: usuarios_sucursales -> sucursales
        await queryRunner.createForeignKey(
            "usuarios_sucursales",
            new TableForeignKey({
                name: "FK_usuarios_sucursales_sucursal",
                columnNames: ["sucursal_id"],
                referencedTableName: "sucursales",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("usuarios_sucursales");
        
        // Eliminar foreign keys
        const foreignKeys = table?.foreignKeys || [];
        for (const fk of foreignKeys) {
            await queryRunner.dropForeignKey("usuarios_sucursales", fk);
        }

        // Eliminar índices
        await queryRunner.dropIndex("usuarios_sucursales", "IDX_usuarios_sucursales_sucursal_id");
        await queryRunner.dropIndex("usuarios_sucursales", "IDX_usuarios_sucursales_usuario_id");

        // Eliminar tabla
        await queryRunner.dropTable("usuarios_sucursales");
    }
}