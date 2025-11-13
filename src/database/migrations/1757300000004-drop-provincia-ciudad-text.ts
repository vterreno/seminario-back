import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class DropProvinciaCiudadText1757300000004 implements MigrationInterface {
    name = 'DropProvinciaCiudadText1757300000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columnas de texto antiguas si existen
        // NOTA: Query Builder no tiene dropColumnIfExists, por lo que mantenemos SQL puro
        await queryRunner.query(`ALTER TABLE "contactos" DROP COLUMN IF EXISTS "provincia"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP COLUMN IF EXISTS "ciudad"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restaurar columnas de texto antiguas (nullable)
        await queryRunner.addColumn(
            "contactos",
            new TableColumn({
                name: "ciudad",
                type: "varchar",
                isNullable: true
            })
        );

        await queryRunner.addColumn(
            "contactos",
            new TableColumn({
                name: "provincia",
                type: "varchar",
                isNullable: true
            })
        );
    }
}