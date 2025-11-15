import { MigrationInterface, QueryRunner, TableUnique } from "typeorm";

export class AddUniqueConstraintProductoProveedor1731600000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primero, eliminar duplicados existentes (mantener solo el más reciente)
        await queryRunner.query(`
            DELETE FROM producto_proveedor
            WHERE id NOT IN (
                SELECT MAX(id)
                FROM producto_proveedor
                WHERE deleted_at IS NULL
                GROUP BY producto_id, proveedor_id
            )
            AND deleted_at IS NULL
        `);

        // Crear índice único para la combinación producto_id + proveedor_id (excluyendo soft deleted)
        await queryRunner.query(`
            CREATE UNIQUE INDEX idx_unique_producto_proveedor 
            ON producto_proveedor (producto_id, proveedor_id) 
            WHERE deleted_at IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar el índice único
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_unique_producto_proveedor
        `);
    }
}
