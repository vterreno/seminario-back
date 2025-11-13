import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddFieldsToCompras1762891669731 implements MigrationInterface {
    name = 'AddFieldsToCompras1762891669731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar numero_compra a sucursales
        await queryRunner.addColumn(
            "sucursales",
            new TableColumn({
                name: "numero_compra",
                type: "int",
                isNullable: false,
                default: 0
            })
        );

        // Cambiar default del precio_venta_especifico
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" 
            ALTER COLUMN "precio_venta_especifico" 
            SET DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("sucursales", "numero_compra");
        
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" 
            ALTER COLUMN "precio_venta_especifico" 
            DROP DEFAULT
        `);
    }
}