import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddNumeroFacturaObservacionesToCompras1718131200000 implements MigrationInterface {
    name = 'AddNumeroFacturaObservacionesToCompras1718131200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar numero_factura a compras
        await queryRunner.addColumn(
            "compras",
            new TableColumn({
                name: "numero_factura",
                type: "varchar",
                length: "100",
                isNullable: true
            })
        );

        // Agregar observaciones a compras
        await queryRunner.addColumn(
            "compras",
            new TableColumn({
                name: "observaciones",
                type: "text",
                isNullable: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("compras", "numero_factura");
        await queryRunner.dropColumn("compras", "observaciones");
    }
}
