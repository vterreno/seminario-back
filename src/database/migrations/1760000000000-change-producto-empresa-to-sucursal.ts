import { MigrationInterface, QueryRunner } from "typeorm";

// 2. Cambiar Productos de empresa_id a sucursal_id
export class ChangeProductoEmpresaToSucursal1760000000000 implements MigrationInterface {
    name = 'ChangeProductoEmpresaToSucursal1760000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminar FK con empresa
        await queryRunner.query(`
            ALTER TABLE "productos" 
            DROP CONSTRAINT IF EXISTS "FK_4697737382403af5c31644ad3ce"
        `);
        
        // Renombrar columna
        await queryRunner.query(`
            ALTER TABLE "productos" 
            RENAME COLUMN "empresa_id" TO "sucursal_id"
        `);
        
        // Agregar nueva FK con sucursales
        await queryRunner.query(`
            ALTER TABLE "productos" 
            ADD CONSTRAINT "FK_productos_sucursal" 
            FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "productos" 
            DROP CONSTRAINT IF EXISTS "FK_productos_sucursal"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "productos" 
            RENAME COLUMN "sucursal_id" TO "empresa_id"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "productos" 
            ADD CONSTRAINT "FK_4697737382403af5c31644ad3ce" 
            FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}