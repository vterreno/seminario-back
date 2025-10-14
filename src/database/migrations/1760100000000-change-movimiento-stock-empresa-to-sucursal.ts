import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeMovimientoStockEmpresaToSucursal1760100000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminar la FK existente de empresa
        await queryRunner.query(`ALTER TABLE "movimiento-stock" DROP CONSTRAINT IF EXISTS "FK_6ad1654ba8c7192ffb33fb23538"`);
        
        // Renombrar la columna empresa_id a sucursal_id
        await queryRunner.query(`ALTER TABLE "movimiento-stock" RENAME COLUMN "empresa_id" TO "sucursal_id"`);
        
        // Agregar la nueva FK hacia sucursales
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ADD CONSTRAINT "FK_movimiento_stock_sucursal" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar la FK de sucursal
        await queryRunner.query(`ALTER TABLE "movimiento-stock" DROP CONSTRAINT IF EXISTS "FK_movimiento_stock_sucursal"`);
        
        // Renombrar la columna sucursal_id a empresa_id
        await queryRunner.query(`ALTER TABLE "movimiento-stock" RENAME COLUMN "sucursal_id" TO "empresa_id"`);
        
        // Restaurar la FK hacia empresa
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ADD CONSTRAINT "FK_6ad1654ba8c7192ffb33fb23538" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
