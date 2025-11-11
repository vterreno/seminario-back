import { MigrationInterface, QueryRunner } from "typeorm";

export class UnidadMedida1759509866492 implements MigrationInterface {
    name = 'UnidadMedida1759509866492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."UQ_contactos_identificacion"`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "unidades_medida" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying(50) NOT NULL, "abreviatura" character varying(10) NOT NULL, "acepta_decimales" boolean NOT NULL DEFAULT false, "empresa_id" integer, "productos_id" character varying, "estado" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b299f0e6758c0c02ae3e729232a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_842a2d613bb95917252ef186a2" ON "unidades_medida" ("abreviatura", "empresa_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_a9b659026f7f0a140111a57bb5" ON "unidades_medida" ("nombre", "empresa_id") `);
        
        // Verificar si la columna ya existe antes de agregarla
        const checkColumn = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='productos' AND column_name='unidad_medida_id'
        `);
        if (checkColumn.length === 0) {
            await queryRunner.query(`ALTER TABLE "productos" ADD "unidad_medida_id" integer`);
        }
        
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ALTER COLUMN "tipo_movimiento" SET DEFAULT 'STOCK_APERTURA'`);
        
        // Agregar constraints solo si no existen
        const ciudadesFK = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name='ciudades' AND constraint_name='FK_f8fde174d0faa2d4d60f79715fa'
        `);
        if (ciudadesFK.length === 0) {
            await queryRunner.query(`ALTER TABLE "ciudades" ADD CONSTRAINT "FK_f8fde174d0faa2d4d60f79715fa" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
        
        const contactosEmpresaFK = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name='contactos' AND constraint_name='FK_3ca923c9a0f1cf8f743b34d1b8c'
        `);
        if (contactosEmpresaFK.length === 0) {
            await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_3ca923c9a0f1cf8f743b34d1b8c" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
        
        const contactosProvinciaFK = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name='contactos' AND constraint_name='FK_59b906170b894a5c2f08ac044c9'
        `);
        if (contactosProvinciaFK.length === 0) {
            await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_59b906170b894a5c2f08ac044c9" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
        
        const contactosCiudadFK = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name='contactos' AND constraint_name='FK_cdbe481bcf87c4fe1a71f491f76'
        `);
        if (contactosCiudadFK.length === 0) {
            await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_cdbe481bcf87c4fe1a71f491f76" FOREIGN KEY ("ciudad_id") REFERENCES "ciudades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
        
        const unidadesMedidaFK = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name='unidades_medida' AND constraint_name='FK_3e76b73ba043e1cb531b8a4cec8'
        `);
        if (unidadesMedidaFK.length === 0) {
            await queryRunner.query(`ALTER TABLE "unidades_medida" ADD CONSTRAINT "FK_3e76b73ba043e1cb531b8a4cec8" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
        
        const productosUnidadFK = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name='productos' AND constraint_name='FK_d9d573eddc1e6de0f2ded4fd888'
        `);
        if (productosUnidadFK.length === 0) {
            await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_d9d573eddc1e6de0f2ded4fd888" FOREIGN KEY ("unidad_medida_id") REFERENCES "unidades_medida"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_d9d573eddc1e6de0f2ded4fd888"`);
        await queryRunner.query(`ALTER TABLE "unidades_medida" DROP CONSTRAINT "FK_3e76b73ba043e1cb531b8a4cec8"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_cdbe481bcf87c4fe1a71f491f76"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_59b906170b894a5c2f08ac044c9"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_3ca923c9a0f1cf8f743b34d1b8c"`);
        await queryRunner.query(`ALTER TABLE "ciudades" DROP CONSTRAINT "FK_f8fde174d0faa2d4d60f79715fa"`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ALTER COLUMN "tipo_movimiento" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "unidad_medida_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9b659026f7f0a140111a57bb5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_842a2d613bb95917252ef186a2"`);
        await queryRunner.query(`DROP TABLE "unidades_medida"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_contactos_identificacion" ON "contactos" ("empresa_id", "numero_identificacion", "tipo_identificacion") WHERE ((tipo_identificacion IS NOT NULL) AND (numero_identificacion IS NOT NULL))`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_ciudad" FOREIGN KEY ("ciudad_id") REFERENCES "ciudades"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_provincia" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_empresa" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ciudades" ADD CONSTRAINT "FK_ciudades_provincia" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
