import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddNumeroFacturaObservacionesCompras1763151000000 implements MigrationInterface {
    name = 'AddNumeroFacturaObservacionesCompras1763151000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar pago_id a compras
        await queryRunner.addColumn(
            "compras",
            new TableColumn({
                name: "pago_id",
                type: "integer",
                isNullable: true
            })
        );

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

        // Agregar foreign key para pago_id
        await queryRunner.createForeignKey(
            "compras",
            new TableForeignKey({
                name: "FK_compras_pago",
                columnNames: ["pago_id"],
                referencedTableName: "pagos",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL"
            })
        );

        // Agregar constraint unique para pago_id (relación OneToOne)
        await queryRunner.query(`
            ALTER TABLE "compras" 
            ADD CONSTRAINT "UQ_compras_pago_id" UNIQUE ("pago_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar constraint unique
        await queryRunner.query(`
            ALTER TABLE "compras" 
            DROP CONSTRAINT IF EXISTS "UQ_compras_pago_id"
        `);

        // Eliminar foreign key
        await queryRunner.dropForeignKey("compras", "FK_compras_pago");

        // Eliminar columnas en caso de rollback
        await queryRunner.dropColumn("compras", "observaciones");
        await queryRunner.dropColumn("compras", "numero_factura");
        await queryRunner.dropColumn("compras", "pago_id");
    }
}
