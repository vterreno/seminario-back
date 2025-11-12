import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFieldsToCompras1731355708000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna numero_factura
    await queryRunner.addColumn(
      'compras',
      new TableColumn({
        name: 'numero_factura',
        type: 'varchar',
        length: '100',
        isNullable: true,
      })
    );

    // Agregar columna observaciones
    await queryRunner.addColumn(
      'compras',
      new TableColumn({
        name: 'observaciones',
        type: 'text',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar columna observaciones
    await queryRunner.dropColumn('compras', 'observaciones');
    
    // Eliminar columna numero_factura
    await queryRunner.dropColumn('compras', 'numero_factura');
  }
}
