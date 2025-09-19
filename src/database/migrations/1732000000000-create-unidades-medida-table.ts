import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUnidadesMedidaTable1732000000000 implements MigrationInterface {
    name = 'CreateUnidadesMedidaTable1732000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "unidades_medida" (
                "id" SERIAL NOT NULL,
                "nombre" character varying(50) NOT NULL,
                "abreviatura" character varying(10) NOT NULL,
                "acepta_decimales" boolean NOT NULL DEFAULT false,
                "empresa_id" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_unidades_medida_id" PRIMARY KEY ("id")
            )
        `);

        // Crear índices únicos para nombre y abreviatura por empresa
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_unidades_medida_nombre_empresa" 
            ON "unidades_medida" ("nombre", "empresa_id") 
            WHERE "deleted_at" IS NULL
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_unidades_medida_abreviatura_empresa" 
            ON "unidades_medida" ("abreviatura", "empresa_id") 
            WHERE "deleted_at" IS NULL
        `);

        // Crear foreign key constraint con empresa
        await queryRunner.query(`
            ALTER TABLE "unidades_medida" 
            ADD CONSTRAINT "FK_unidades_medida_empresa_id" 
            FOREIGN KEY ("empresa_id") 
            REFERENCES "empresa"("id") 
            ON DELETE RESTRICT ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "unidades_medida" DROP CONSTRAINT "FK_unidades_medida_empresa_id"`);
        await queryRunner.query(`DROP INDEX "IDX_unidades_medida_abreviatura_empresa"`);
        await queryRunner.query(`DROP INDEX "IDX_unidades_medida_nombre_empresa"`);
        await queryRunner.query(`DROP TABLE "unidades_medida"`);
    }
}