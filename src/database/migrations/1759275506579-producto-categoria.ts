import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductoCategoria1759275506579 implements MigrationInterface {
    name = 'ProductoCategoria1759275506579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ciudades" DROP CONSTRAINT "FK_ciudades_provincia"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_contactos_empresa"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_contactos_provincia"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_contactos_ciudad"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_contactos_identificacion"`);
        await queryRunner.query(`ALTER TABLE "productos" ADD "categoria_id" integer`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ALTER COLUMN "tipo_movimiento" SET DEFAULT 'STOCK_APERTURA'`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_5aaee6054b643e7c778477193a3" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ciudades" ADD CONSTRAINT "FK_f8fde174d0faa2d4d60f79715fa" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_3ca923c9a0f1cf8f743b34d1b8c" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_59b906170b894a5c2f08ac044c9" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_cdbe481bcf87c4fe1a71f491f76" FOREIGN KEY ("ciudad_id") REFERENCES "ciudades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_cdbe481bcf87c4fe1a71f491f76"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_59b906170b894a5c2f08ac044c9"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_3ca923c9a0f1cf8f743b34d1b8c"`);
        await queryRunner.query(`ALTER TABLE "ciudades" DROP CONSTRAINT "FK_f8fde174d0faa2d4d60f79715fa"`);
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_5aaee6054b643e7c778477193a3"`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ALTER COLUMN "tipo_movimiento" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "categoria_id"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_contactos_identificacion" ON "contactos" ("empresa_id", "numero_identificacion", "tipo_identificacion") WHERE ((tipo_identificacion IS NOT NULL) AND (numero_identificacion IS NOT NULL))`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_ciudad" FOREIGN KEY ("ciudad_id") REFERENCES "ciudades"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_provincia" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_empresa" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ciudades" ADD CONSTRAINT "FK_ciudades_provincia" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
