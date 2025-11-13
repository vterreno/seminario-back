import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RenameSucursalToSucursales1757255750152 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Renombrar tabla de sucursal a sucursales
        await queryRunner.renameTable("sucursal", "sucursales");
        
        // Renombrar columna de name a nombre
        await queryRunner.renameColumn("sucursales", "name", "nombre");
        
        // Para codigo_sucursal → codigo, mantenemos el SQL puro porque 
        // tiene lógica condicional compleja (DO $$ block)
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sucursales' AND column_name = 'codigo_sucursal') THEN
                    ALTER TABLE "sucursales" RENAME COLUMN "codigo_sucursal" TO "codigo";
                ELSE
                    ALTER TABLE "sucursales" ADD COLUMN "codigo" character varying NOT NULL DEFAULT 'SUC000';
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Renombrar codigo a codigo_sucursal
        await queryRunner.renameColumn("sucursales", "codigo", "codigo_sucursal");
        
        // Renombrar columna de nombre a name
        await queryRunner.renameColumn("sucursales", "nombre", "name");
        
        // Renombrar tabla de sucursales a sucursal
        await queryRunner.renameTable("sucursales", "sucursal");
    }
}