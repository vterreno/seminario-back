import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddSucursalIdToPagos1763600000000 implements MigrationInterface {
    name = 'AddSucursalIdToPagos1763600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const pagosTable = await queryRunner.getTable('pagos');
        if (pagosTable && !pagosTable.findColumnByName('sucursal_id')) {
            await queryRunner.addColumn('pagos', new TableColumn({
                name: 'sucursal_id',
                type: 'int',
                isNullable: true,
            }));

            await queryRunner.createForeignKey('pagos', new TableForeignKey({
                columnNames: ['sucursal_id'],
                referencedTableName: 'sucursales',
                referencedColumnNames: ['id'],
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION',
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const pagosTable = await queryRunner.getTable('pagos');
        if (pagosTable) {
            const fk = pagosTable.foreignKeys.find(f => f.columnNames.includes('sucursal_id'));
            if (fk) await queryRunner.dropForeignKey('pagos', fk);
            const col = pagosTable.findColumnByName('sucursal_id');
            if (col) await queryRunner.dropColumn('pagos', 'sucursal_id');
        }
    }
}
