import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmpresaIdToUnidadesMedida1761600000000 implements MigrationInterface {
    name = 'AddEmpresaIdToUnidadesMedida1761600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la columna empresa_id ya existe
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'unidades_medida' AND column_name = 'empresa_id'
        `);

        if (columnExists.length === 0) {
            console.log('🔄 Agregando columna empresa_id a unidades_medida...');
            
            // Agregar la columna empresa_id
            await queryRunner.query(`
                ALTER TABLE "unidades_medida" 
                ADD "empresa_id" integer
            `);

            // Agregar la constraint foreign key
            await queryRunner.query(`
                ALTER TABLE "unidades_medida" 
                ADD CONSTRAINT "FK_unidades_medida_empresa" 
                FOREIGN KEY ("empresa_id") 
                REFERENCES "empresa"("id") 
                ON DELETE NO ACTION ON UPDATE NO ACTION
            `);

            // Crear índices únicos compuestos
            await queryRunner.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS "IDX_unidades_medida_nombre_empresa" 
                ON "unidades_medida" ("nombre", "empresa_id")
            `);

            await queryRunner.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS "IDX_unidades_medida_abreviatura_empresa" 
                ON "unidades_medida" ("abreviatura", "empresa_id")
            `);

            console.log('✅ Columna empresa_id agregada exitosamente a unidades_medida');
        } else {
            console.log('✅ La columna empresa_id ya existe en unidades_medida');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar los índices primero
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_unidades_medida_abreviatura_empresa"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_unidades_medida_nombre_empresa"`);
        
        // Eliminar la constraint foreign key
        await queryRunner.query(`ALTER TABLE "unidades_medida" DROP CONSTRAINT IF EXISTS "FK_unidades_medida_empresa"`);
        
        // Eliminar la columna
        await queryRunner.query(`ALTER TABLE "unidades_medida" DROP COLUMN IF EXISTS "empresa_id"`);
    }
}