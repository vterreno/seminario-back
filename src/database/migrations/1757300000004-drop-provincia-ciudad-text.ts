import { MigrationInterface, QueryRunner } from "typeorm";

export class DropProvinciaCiudadText1757300000004 implements MigrationInterface {
    name = 'DropProvinciaCiudadText1757300000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove old text columns if they exist
        await queryRunner.query(`ALTER TABLE "contactos" DROP COLUMN IF EXISTS "provincia"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP COLUMN IF EXISTS "ciudad"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restore old text columns (nullable)
        await queryRunner.query(`ALTER TABLE "contactos" ADD COLUMN "ciudad" character varying`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD COLUMN "provincia" character varying`);
    }
}


