import { MigrationInterface, QueryRunner } from "typeorm";

export class ListaPrecios1759688604002 implements MigrationInterface {
    name = 'ListaPrecios1759688604002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "producto_lista_precios" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "producto_id" integer NOT NULL, "lista_precios_id" integer NOT NULL, "precio_venta_especifico" numeric(10,2) NOT NULL, CONSTRAINT "PK_a44030885de8046a0a08650646d" PRIMARY KEY ("id", "producto_id", "lista_precios_id"))`);
        await queryRunner.query(`CREATE TABLE "lista_precios" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying NOT NULL, "descripcion" character varying, "estado" boolean NOT NULL DEFAULT true, "empresa_id" integer, CONSTRAINT "UQ_8f86ebcb74e505dea79f9bd8ec0" UNIQUE ("nombre"), CONSTRAINT "PK_5bafe7a6eddff5bd5436621b39f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_a44030885de8046a0a08650646d"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1" PRIMARY KEY ("producto_id", "lista_precios_id")`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "precio_venta_especifico"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_a44030885de8046a0a08650646d" PRIMARY KEY ("producto_id", "lista_precios_id", "id")`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "precio_venta_especifico" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_a44030885de8046a0a08650646d"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1" PRIMARY KEY ("producto_id", "lista_precios_id")`);
        await queryRunner.query(`ALTER TABLE "permisos" ADD CONSTRAINT "UQ_40d964f2742b2f4e3f379d3f460" UNIQUE ("codigo")`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ALTER COLUMN "tipo_movimiento" SET DEFAULT 'STOCK_APERTURA'`);
        await queryRunner.query(`CREATE INDEX "IDX_bc9af6033b3462afefe9b1e294" ON "producto_lista_precios" ("producto_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4ff0544939ce1c8797b0c85734" ON "producto_lista_precios" ("lista_precios_id") `);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "FK_4ff0544939ce1c8797b0c857344" FOREIGN KEY ("lista_precios_id") REFERENCES "lista_precios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lista_precios" ADD CONSTRAINT "FK_7cce1d60976b6d49a5ac4d3dff9" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lista_precios" DROP CONSTRAINT "FK_7cce1d60976b6d49a5ac4d3dff9"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_cdbe481bcf87c4fe1a71f491f76"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_59b906170b894a5c2f08ac044c9"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_3ca923c9a0f1cf8f743b34d1b8c"`);
        await queryRunner.query(`ALTER TABLE "ciudades" DROP CONSTRAINT "FK_f8fde174d0faa2d4d60f79715fa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ff0544939ce1c8797b0c85734"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc9af6033b3462afefe9b1e294"`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ALTER COLUMN "tipo_movimiento" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "permisos" DROP CONSTRAINT "UQ_40d964f2742b2f4e3f379d3f460"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_a44030885de8046a0a08650646d" PRIMARY KEY ("producto_id", "lista_precios_id", "id")`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "precio_venta_especifico"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_a44030885de8046a0a08650646d"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1" PRIMARY KEY ("producto_id", "lista_precios_id")`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "precio_venta_especifico" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_a44030885de8046a0a08650646d" PRIMARY KEY ("id", "producto_id", "lista_precios_id")`);
        await queryRunner.query(`DROP TABLE "lista_precios"`);
        await queryRunner.query(`DROP TABLE "producto_lista_precios"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_contactos_identificacion" ON "contactos" ("empresa_id", "numero_identificacion", "tipo_identificacion") WHERE ((tipo_identificacion IS NOT NULL) AND (numero_identificacion IS NOT NULL))`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_ciudad" FOREIGN KEY ("ciudad_id") REFERENCES "ciudades"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_provincia" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_empresa" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ciudades" ADD CONSTRAINT "FK_ciudades_provincia" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
