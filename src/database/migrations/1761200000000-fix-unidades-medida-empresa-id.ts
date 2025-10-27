import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUnidadesMedidaEmpresaId1761200000000 implements MigrationInterface {
    name = 'FixUnidadesMedidaEmpresaId1761200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la columna empresa_id existe en la tabla unidades_medida
        const checkColumn = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='unidades_medida' AND column_name='empresa_id'
        `);
        
        // Si la columna no existe, agregarla
        if (checkColumn.length === 0) {
            console.log('Agregando columna empresa_id a unidades_medida...');
            await queryRunner.query(`ALTER TABLE "unidades_medida" ADD "empresa_id" integer`);
            
            // Agregar el constraint de foreign key
            await queryRunner.query(`
                ALTER TABLE "unidades_medida" 
                ADD CONSTRAINT "FK_3e76b73ba043e1cb531b8a4cec8" 
                FOREIGN KEY ("empresa_id") 
                REFERENCES "empresa"("id") 
                ON DELETE NO ACTION 
                ON UPDATE NO ACTION
            `);
            
            // Recrear los índices únicos si no existen
            const checkIndexNombre = await queryRunner.query(`
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename='unidades_medida' AND indexname='IDX_a9b659026f7f0a140111a57bb5'
            `);
            
            if (checkIndexNombre.length === 0) {
                await queryRunner.query(`
                    CREATE UNIQUE INDEX "IDX_a9b659026f7f0a140111a57bb5" 
                    ON "unidades_medida" ("nombre", "empresa_id")
                `);
            }
            
            const checkIndexAbreviatura = await queryRunner.query(`
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename='unidades_medida' AND indexname='IDX_842a2d613bb95917252ef186a2'
            `);
            
            if (checkIndexAbreviatura.length === 0) {
                await queryRunner.query(`
                    CREATE UNIQUE INDEX "IDX_842a2d613bb95917252ef186a2" 
                    ON "unidades_medida" ("abreviatura", "empresa_id")
                `);
            }
            
            console.log('Columna empresa_id agregada exitosamente a unidades_medida');
        } else {
            console.log('La columna empresa_id ya existe en unidades_medida');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Verificar si el constraint existe antes de eliminarlo
        const checkConstraint = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name='unidades_medida' AND constraint_name='FK_3e76b73ba043e1cb531b8a4cec8'
        `);
        
        if (checkConstraint.length > 0) {
            await queryRunner.query(`ALTER TABLE "unidades_medida" DROP CONSTRAINT "FK_3e76b73ba043e1cb531b8a4cec8"`);
        }
        
        // Eliminar índices
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_a9b659026f7f0a140111a57bb5"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_842a2d613bb95917252ef186a2"`);
        
        // Verificar si la columna existe antes de eliminarla
        const checkColumn = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='unidades_medida' AND column_name='empresa_id'
        `);
        
        if (checkColumn.length > 0) {
            await queryRunner.query(`ALTER TABLE "unidades_medida" DROP COLUMN "empresa_id"`);
        }
    }
}
