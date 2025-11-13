import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class Marca1758061494240 implements MigrationInterface {
    name = 'Marca1758061494240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminar constraints existentes CON VERIFICACIÓN
        const sucursalesTable = await queryRunner.getTable("sucursales");
        const rolesTable = await queryRunner.getTable("roles");
        const rolesPermisosTable = await queryRunner.getTable("roles_permisos");

        // Verificar y eliminar FK de sucursales si existe
        const sucursalesFk = sucursalesTable?.foreignKeys.find(fk => fk.name === "FK_c91767b4a90714f328e567bdcae");
        if (sucursalesFk) {
            await queryRunner.dropForeignKey("sucursales", sucursalesFk);
        }

        // Verificar y eliminar FK de roles si existe
        const rolesFk = rolesTable?.foreignKeys.find(fk => fk.name === "FK_roles_empresa");
        if (rolesFk) {
            await queryRunner.dropForeignKey("roles", rolesFk);
        }

        // Verificar y eliminar FK de roles_permisos si existe
        const rolesPermisosFk = rolesPermisosTable?.foreignKeys.find(fk => fk.name === "FK_97cec863070ebbe3c9074f9ade7");
        if (rolesPermisosFk) {
            await queryRunner.dropForeignKey("roles_permisos", rolesPermisosFk);
        }

        // Verificar y eliminar índice de roles_permisos si existe
        const rolesPermisosIndex = rolesPermisosTable?.indices.find(index => index.name === "IDX_97cec863070ebbe3c9074f9ade");
        if (rolesPermisosIndex) {
            await queryRunner.dropIndex("roles_permisos", rolesPermisosIndex);
        }

        // Crear tabla marcas
        await queryRunner.createTable(
            new Table({
                name: "marcas",
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
                        name: "descripcion",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "empresa_id",
                        type: "int",
                        isNullable: true
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

        // Manejo de secuencia (SQL puro porque es específico de PostgreSQL)
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "sucursales_id_seq" OWNED BY "sucursales"."id"`);
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "id" SET DEFAULT nextval('"sucursales_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "id" DROP DEFAULT`);

        // VERIFICAR si el nuevo índice ya existe antes de crearlo
        const newIndexExists = rolesPermisosTable?.indices.find(index => index.name === "IDX_04295de30b7e92293a2e1a7c4b");
        if (!newIndexExists) {
            // Crear nuevo índice solo si no existe
            await queryRunner.createIndex(
                "roles_permisos",
                new TableIndex({
                    name: "IDX_04295de30b7e92293a2e1a7c4b",
                    columnNames: ["permisos_id"]
                })
            );
        }

        // Crear foreign keys con nuevos nombres CON VERIFICACIÓN
        const sucursalesFkExists = sucursalesTable?.foreignKeys.find(fk => fk.name === "FK_9da95c9691116c5c72fd56dee28");
        if (!sucursalesFkExists) {
            await queryRunner.createForeignKey(
                "sucursales",
                new TableForeignKey({
                    name: "FK_9da95c9691116c5c72fd56dee28",
                    columnNames: ["empresa_id"],
                    referencedTableName: "empresa",
                    referencedColumnNames: ["id"],
                    onDelete: "NO ACTION",
                    onUpdate: "NO ACTION"
                })
            );
        }

        const marcasFkExists = (await queryRunner.getTable("marcas"))?.foreignKeys.find(fk => fk.name === "FK_34ae73140f8d19ec698063acd38");
        if (!marcasFkExists) {
            await queryRunner.createForeignKey(
                "marcas",
                new TableForeignKey({
                    name: "FK_34ae73140f8d19ec698063acd38",
                    columnNames: ["empresa_id"],
                    referencedTableName: "empresa",
                    referencedColumnNames: ["id"],
                    onDelete: "NO ACTION",
                    onUpdate: "NO ACTION"
                })
            );
        }

        const rolesFkExists = rolesTable?.foreignKeys.find(fk => fk.name === "FK_c878b09454f9b90ac189861bbdb");
        if (!rolesFkExists) {
            await queryRunner.createForeignKey(
                "roles",
                new TableForeignKey({
                    name: "FK_c878b09454f9b90ac189861bbdb",
                    columnNames: ["empresa_id"],
                    referencedTableName: "empresa",
                    referencedColumnNames: ["id"],
                    onDelete: "NO ACTION",
                    onUpdate: "NO ACTION"
                })
            );
        }

        const rolesPermisosNewFkExists = rolesPermisosTable?.foreignKeys.find(fk => fk.name === "FK_04295de30b7e92293a2e1a7c4b7");
        if (!rolesPermisosNewFkExists) {
            await queryRunner.createForeignKey(
                "roles_permisos",
                new TableForeignKey({
                    name: "FK_04295de30b7e92293a2e1a7c4b7",
                    columnNames: ["permisos_id"],
                    referencedTableName: "permisos",
                    referencedColumnNames: ["id"],
                    onDelete: "NO ACTION",
                    onUpdate: "NO ACTION"
                })
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar nuevas foreign keys con verificación
        const sucursalesTable = await queryRunner.getTable("sucursales");
        const rolesTable = await queryRunner.getTable("roles");
        const rolesPermisosTable = await queryRunner.getTable("roles_permisos");
        const marcasTable = await queryRunner.getTable("marcas");

        const rolesPermisosNewFk = rolesPermisosTable?.foreignKeys.find(fk => fk.name === "FK_04295de30b7e92293a2e1a7c4b7");
        if (rolesPermisosNewFk) {
            await queryRunner.dropForeignKey("roles_permisos", rolesPermisosNewFk);
        }

        const rolesNewFk = rolesTable?.foreignKeys.find(fk => fk.name === "FK_c878b09454f9b90ac189861bbdb");
        if (rolesNewFk) {
            await queryRunner.dropForeignKey("roles", rolesNewFk);
        }

        const marcasFk = marcasTable?.foreignKeys.find(fk => fk.name === "FK_34ae73140f8d19ec698063acd38");
        if (marcasFk) {
            await queryRunner.dropForeignKey("marcas", marcasFk);
        }

        const sucursalesNewFk = sucursalesTable?.foreignKeys.find(fk => fk.name === "FK_9da95c9691116c5c72fd56dee28");
        if (sucursalesNewFk) {
            await queryRunner.dropForeignKey("sucursales", sucursalesNewFk);
        }
        
        // Eliminar nuevo índice
        const newIndex = rolesPermisosTable?.indices.find(index => index.name === "IDX_04295de30b7e92293a2e1a7c4b");
        if (newIndex) {
            await queryRunner.dropIndex("roles_permisos", newIndex);
        }
        
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "id" SET DEFAULT nextval('sucursal_id_seq')`);
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "sucursales_id_seq"`);
        
        await queryRunner.dropTable("marcas");
        
        // Recrear índices y FKs originales
        const oldIndexExists = rolesPermisosTable?.indices.find(index => index.name === "IDX_97cec863070ebbe3c9074f9ade");
        if (!oldIndexExists) {
            await queryRunner.createIndex(
                "roles_permisos",
                new TableIndex({
                    name: "IDX_97cec863070ebbe3c9074f9ade",
                    columnNames: ["permisos_id"]
                })
            );
        }

        const oldRolesPermisosFkExists = rolesPermisosTable?.foreignKeys.find(fk => fk.name === "FK_97cec863070ebbe3c9074f9ade7");
        if (!oldRolesPermisosFkExists) {
            await queryRunner.createForeignKey(
                "roles_permisos",
                new TableForeignKey({
                    name: "FK_97cec863070ebbe3c9074f9ade7",
                    columnNames: ["permisos_id"],
                    referencedTableName: "permisos",
                    referencedColumnNames: ["id"],
                    onDelete: "NO ACTION",
                    onUpdate: "NO ACTION"
                })
            );
        }

        const oldRolesFkExists = rolesTable?.foreignKeys.find(fk => fk.name === "FK_roles_empresa");
        if (!oldRolesFkExists) {
            await queryRunner.createForeignKey(
                "roles",
                new TableForeignKey({
                    name: "FK_roles_empresa",
                    columnNames: ["empresa_id"],
                    referencedTableName: "empresa",
                    referencedColumnNames: ["id"],
                    onDelete: "CASCADE",
                    onUpdate: "NO ACTION"
                })
            );
        }

        const oldSucursalesFkExists = sucursalesTable?.foreignKeys.find(fk => fk.name === "FK_c91767b4a90714f328e567bdcae");
        if (!oldSucursalesFkExists) {
            await queryRunner.createForeignKey(
                "sucursales",
                new TableForeignKey({
                    name: "FK_c91767b4a90714f328e567bdcae",
                    columnNames: ["empresa_id"],
                    referencedTableName: "empresa",
                    referencedColumnNames: ["id"],
                    onDelete: "NO ACTION",
                    onUpdate: "NO ACTION"
                })
            );
        }
    }
}