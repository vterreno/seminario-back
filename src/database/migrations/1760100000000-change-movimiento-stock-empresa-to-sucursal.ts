import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from "typeorm";

export class ChangeMovimientoStockEmpresaToSucursal1760100000000 implements MigrationInterface {
    name = 'ChangeMovimientoStockEmpresaToSucursal1760100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("movimiento-stock");
        
        // Eliminar FK con empresa
        const foreignKey = table?.foreignKeys.find(
            fk => fk.columnNames.indexOf("empresa_id") !== -1
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey("movimiento-stock", foreignKey);
        }

        // Renombrar columna
        await queryRunner.renameColumn("movimiento-stock", "empresa_id", "sucursal_id");

        // Crear nueva FK con sucursales
        await queryRunner.createForeignKey(
            "movimiento-stock",
            new TableForeignKey({
                name: "FK_movimiento_stock_sucursal",
                columnNames: ["sucursal_id"],
                referencedTableName: "sucursales",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("movimiento-stock");
        
        // Eliminar FK con sucursales
        const foreignKey = table?.foreignKeys.find(
            fk => fk.columnNames.indexOf("sucursal_id") !== -1
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey("movimiento-stock", foreignKey);
        }

        // Renombrar columna
        await queryRunner.renameColumn("movimiento-stock", "sucursal_id", "empresa_id");

        // Crear FK con empresa
        await queryRunner.createForeignKey(
            "movimiento-stock",
            new TableForeignKey({
                columnNames: ["empresa_id"],
                referencedTableName: "empresa",
                referencedColumnNames: ["id"],
                onDelete: "NO ACTION",
                onUpdate: "NO ACTION"
            })
        );
    }
}