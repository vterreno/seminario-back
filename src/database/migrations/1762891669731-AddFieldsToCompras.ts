import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToCompras1762891669731 implements MigrationInterface {
    name = 'AddFieldsToCompras1762891669731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc9af6033b3462afefe9b1e294"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ff0544939ce1c8797b0c85734"`);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "deleted_at"`);

        // Quitar la columna vieja sin default
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "precio_venta_especifico"`);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_a44030885de8046a0a08650646d" PRIMARY KEY ("producto_id", "lista_precios_id", "id")`);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "deleted_at" TIMESTAMP`);

        // ✅ Columna corregida con DEFAULT 0
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD "precio_venta_especifico" numeric(10,2) NOT NULL DEFAULT 0
        `);

        // ✅ ESTA SÍ va
        await queryRunner.query(`ALTER TABLE "sucursales" ADD "numero_compra" integer NOT NULL DEFAULT '0'`);

        // ❌ ESTAS DOS SE QUITAN (ya existen)
        // await queryRunner.query(`ALTER TABLE "compras" ADD "numero_factura" character varying(100)`);
        // await queryRunner.query(`ALTER TABLE "compras" ADD "observaciones" text`);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_a44030885de8046a0a08650646d"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1" PRIMARY KEY ("producto_id", "lista_precios_id")`);

        await queryRunner.query(`CREATE INDEX "IDX_bc9af6033b3462afefe9b1e294" ON "producto_lista_precios" ("producto_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_4ff0544939ce1c8797b0c85734" ON "producto_lista_precios" ("lista_precios_id")`);

        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"
            FOREIGN KEY ("producto_id") REFERENCES "productos"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"
            FOREIGN KEY ("lista_precios_id") REFERENCES "lista_precios"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ff0544939ce1c8797b0c85734"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc9af6033b3462afefe9b1e294"`);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_a44030885de8046a0a08650646d" PRIMARY KEY ("producto_id", "lista_precios_id", "id")`);

        // ❌ ESTAS NO VAN (ya existían antes de esta migración)
        // await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "observaciones"`);
        // await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "numero_factura"`);

        await queryRunner.query(`ALTER TABLE "sucursales" DROP COLUMN "numero_compra"`);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "precio_venta_especifico"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "created_at"`);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_a44030885de8046a0a08650646d"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1" PRIMARY KEY ("producto_id", "lista_precios_id")`);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "id"`);

        // Restaurar la columna vieja
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD "precio_venta_especifico" numeric(10,2) NOT NULL DEFAULT 0
        `);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "id" SERIAL NOT NULL`);

        await queryRunner.query(`CREATE INDEX "IDX_4ff0544939ce1c8797b0c85734" ON "producto_lista_precios" ("lista_precios_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_bc9af6033b3462afefe9b1e294" ON "producto_lista_precios" ("producto_id")`);

        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"
            FOREIGN KEY ("producto_id") REFERENCES "productos"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"
            FOREIGN KEY ("lista_precios_id") REFERENCES "lista_precios"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }
}
