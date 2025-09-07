import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameSucursalToSucursales1757255750152 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename table from sucursal to sucursales
        await queryRunner.query(`ALTER TABLE "sucursal" RENAME TO "sucursales"`);
        
        // Rename column from name to nombre
        await queryRunner.query(`ALTER TABLE "sucursales" RENAME COLUMN "name" TO "nombre"`);
        
        // Rename codigo_sucursal to codigo if it exists, or add codigo column
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
        // Rename codigo back to codigo_sucursal
        await queryRunner.query(`ALTER TABLE "sucursales" RENAME COLUMN "codigo" TO "codigo_sucursal"`);
        
        // Rename column from nombre back to name
        await queryRunner.query(`ALTER TABLE "sucursales" RENAME COLUMN "nombre" TO "name"`);
        
        // Rename table back from sucursales to sucursal
        await queryRunner.query(`ALTER TABLE "sucursales" RENAME TO "sucursal"`);
    }

}
