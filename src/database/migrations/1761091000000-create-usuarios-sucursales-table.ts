import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsuariosSucursalesTable1761091000000 implements MigrationInterface {
    name = 'CreateUsuariosSucursalesTable1761091000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la tabla ya existe
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'usuarios_sucursales'
            );
        `);

        if (tableExists[0].exists) {
            console.log('⚠️  La tabla usuarios_sucursales ya existe, saltando creación...');
            return;
        }

        // Crear la tabla usuarios_sucursales (relación many-to-many)
        await queryRunner.query(`
            CREATE TABLE "usuarios_sucursales" (
                "usuario_id" integer NOT NULL,
                "sucursal_id" integer NOT NULL,
                CONSTRAINT "PK_usuarios_sucursales" PRIMARY KEY ("usuario_id", "sucursal_id")
            )
        `);

        // Crear índices
        await queryRunner.query(`
            CREATE INDEX "IDX_usuarios_sucursales_usuario_id" ON "usuarios_sucursales" ("usuario_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_usuarios_sucursales_sucursal_id" ON "usuarios_sucursales" ("sucursal_id")
        `);

        // Agregar foreign keys
        await queryRunner.query(`
            ALTER TABLE "usuarios_sucursales" 
            ADD CONSTRAINT "FK_usuarios_sucursales_usuario" 
            FOREIGN KEY ("usuario_id") 
            REFERENCES "usuarios"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "usuarios_sucursales" 
            ADD CONSTRAINT "FK_usuarios_sucursales_sucursal" 
            FOREIGN KEY ("sucursal_id") 
            REFERENCES "sucursales"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        console.log('✅ Tabla usuarios_sucursales creada exitosamente');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign keys
        await queryRunner.query(`
            ALTER TABLE "usuarios_sucursales" 
            DROP CONSTRAINT IF EXISTS "FK_usuarios_sucursales_sucursal"
        `);

        await queryRunner.query(`
            ALTER TABLE "usuarios_sucursales" 
            DROP CONSTRAINT IF EXISTS "FK_usuarios_sucursales_usuario"
        `);

        // Eliminar índices
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_usuarios_sucursales_sucursal_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_usuarios_sucursales_usuario_id"`);

        // Eliminar tabla
        await queryRunner.query(`DROP TABLE IF EXISTS "usuarios_sucursales"`);

        console.log('✅ Tabla usuarios_sucursales eliminada exitosamente');
    }
}
