import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedConsumidorFinal1757300000001 implements MigrationInterface {
    name = 'SeedConsumidorFinal1757300000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insertar Consumidor Final para todas las empresas que no lo tengan
        await queryRunner.query(`
            INSERT INTO contactos (
                nombre_razon_social,
                condicion_iva,
                rol,
                es_consumidor_final,
                estado,
                empresa_id,
                tipo_identificacion,
                numero_identificacion
            )
            SELECT 'Consumidor Final', 'Consumidor Final', 'cliente', true, true, e.id, 'DNI', '00-00000000-0'
            FROM empresa e
            WHERE NOT EXISTS (
                SELECT 1 FROM contactos c
                WHERE c.empresa_id = e.id AND c.es_consumidor_final = true
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No borrar por seguridad; pero si se requiere, eliminar solo los que tengan esa combinación exacta
        await queryRunner.query(`
            DELETE FROM contactos
            WHERE es_consumidor_final = true AND nombre_razon_social = 'Consumidor Final' AND numero_identificacion = '00-00000000-0'
        `);
    }
}


