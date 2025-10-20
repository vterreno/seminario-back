import { MigrationInterface, QueryRunner } from "typeorm";

export class UnidadMedidaSucursal1761003374136 implements MigrationInterface {
    name = 'UnidadMedidaSucursal1761003374136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movimiento-stock" DROP CONSTRAINT "FK_movimiento_stock_sucursal"`);
        await queryRunner.query(`ALTER TABLE "lista_precios" DROP CONSTRAINT "FK_7cce1d60976b6d49a5ac4d3dff9"`);
        await queryRunner.query(`ALTER TABLE "unidades_medida" DROP CONSTRAINT "FK_3e76b73ba043e1cb531b8a4cec8"`);
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_productos_sucursal"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc9af6033b3462afefe9b1e294"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ff0544939ce1c8797b0c85734"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_842a2d613bb95917252ef186a2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9b659026f7f0a140111a57bb5"`);
        await queryRunner.query(`ALTER TABLE "lista_precios" RENAME COLUMN "empresa_id" TO "sucursal_id"`);
        await queryRunner.query(`ALTER TABLE "unidades_medida" RENAME COLUMN "empresa_id" TO "sucursal_id"`);
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
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "numero_venta" SET DEFAULT '0'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_38d6c9f5003f4a93d114ec38d1" ON "unidades_medida" ("abreviatura", "sucursal_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1cbc1aae9db55198fe1c415c82" ON "unidades_medida" ("nombre", "sucursal_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc9af6033b3462afefe9b1e294" ON "producto_lista_precios" ("producto_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4ff0544939ce1c8797b0c85734" ON "producto_lista_precios" ("lista_precios_id") `);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ADD CONSTRAINT "FK_f87224555c4e7a154a4db2baf1f" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "FK_4ff0544939ce1c8797b0c857344" FOREIGN KEY ("lista_precios_id") REFERENCES "lista_precios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lista_precios" ADD CONSTRAINT "FK_407259891f917e4f3f9a33a6b28" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unidades_medida" ADD CONSTRAINT "FK_22f97c4510a45dc5ed36ced2633" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_65f8d9b1e2bf86529509b8698d6" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_65f8d9b1e2bf86529509b8698d6"`);
        await queryRunner.query(`ALTER TABLE "unidades_medida" DROP CONSTRAINT "FK_22f97c4510a45dc5ed36ced2633"`);
        await queryRunner.query(`ALTER TABLE "lista_precios" DROP CONSTRAINT "FK_407259891f917e4f3f9a33a6b28"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" DROP CONSTRAINT "FK_f87224555c4e7a154a4db2baf1f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ff0544939ce1c8797b0c85734"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc9af6033b3462afefe9b1e294"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1cbc1aae9db55198fe1c415c82"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_38d6c9f5003f4a93d114ec38d1"`);
        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "numero_venta" DROP DEFAULT`);
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
        await queryRunner.query(`ALTER TABLE "unidades_medida" RENAME COLUMN "sucursal_id" TO "empresa_id"`);
        await queryRunner.query(`ALTER TABLE "lista_precios" RENAME COLUMN "sucursal_id" TO "empresa_id"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a9b659026f7f0a140111a57bb5" ON "unidades_medida" ("empresa_id", "nombre") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_842a2d613bb95917252ef186a2" ON "unidades_medida" ("abreviatura", "empresa_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4ff0544939ce1c8797b0c85734" ON "producto_lista_precios" ("lista_precios_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc9af6033b3462afefe9b1e294" ON "producto_lista_precios" ("producto_id") `);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "FK_4ff0544939ce1c8797b0c857344" FOREIGN KEY ("lista_precios_id") REFERENCES "lista_precios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_productos_sucursal" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unidades_medida" ADD CONSTRAINT "FK_3e76b73ba043e1cb531b8a4cec8" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lista_precios" ADD CONSTRAINT "FK_7cce1d60976b6d49a5ac4d3dff9" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ADD CONSTRAINT "FK_movimiento_stock_sucursal" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
