import { MigrationInterface, QueryRunner } from "typeorm";

export class CorreccionCompras1762969776312 implements MigrationInterface {
    name = 'CorreccionCompras1762969776312';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- Eliminar claves foráneas e índices ---
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_4ff0544939ce1c8797b0c85734"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bc9af6033b3462afefe9b1e294"`);

        // --- Ajustar columnas ---
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN IF EXISTS "id"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN IF EXISTS "created_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN IF EXISTS "updated_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN IF EXISTS "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN IF EXISTS "precio_venta_especifico"`);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT IF EXISTS "PK_5a0c09978b089c2479350ccbdf1"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_a44030885de8046a0a08650646d" PRIMARY KEY ("producto_id", "lista_precios_id", "id")`);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "precio_venta_especifico" numeric(10,2) NOT NULL DEFAULT 0`);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT IF EXISTS "PK_a44030885de8046a0a08650646d"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1" PRIMARY KEY ("producto_id", "lista_precios_id")`);

        // --- Corregir ENUM de compras ---
        await queryRunner.query(`ALTER TYPE "public"."compras_estado_enum" RENAME TO "compras_estado_enum_old"`);

        // ⚠️ Primero actualizamos los valores que no estarán en el nuevo ENUM
        await queryRunner.query(`
            UPDATE "compras"
            SET "estado" = 'PENDIENTE_PAGO'
            WHERE "estado" NOT IN ('PENDIENTE_PAGO', 'PAGADO');
        `);

        await queryRunner.query(`CREATE TYPE "public"."compras_estado_enum" AS ENUM('PENDIENTE_PAGO', 'PAGADO')`);
        await queryRunner.query(`ALTER TABLE "compras" ALTER COLUMN "estado" DROP DEFAULT`);
        await queryRunner.query(`
            ALTER TABLE "compras"
            ALTER COLUMN "estado"
            TYPE "public"."compras_estado_enum"
            USING "estado"::text::"public"."compras_estado_enum"
        `);
        await queryRunner.query(`ALTER TABLE "compras" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE_PAGO'`);
        await queryRunner.query(`DROP TYPE "public"."compras_estado_enum_old"`);

        // --- Re-crear índices y claves foráneas ---
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bc9af6033b3462afefe9b1e294" ON "producto_lista_precios" ("producto_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_4ff0544939ce1c8797b0c85734" ON "producto_lista_precios" ("lista_precios_id")`);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"
            FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"
            FOREIGN KEY ("lista_precios_id") REFERENCES "lista_precios"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir cambios del ENUM
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_4ff0544939ce1c8797b0c85734"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bc9af6033b3462afefe9b1e294"`);

        await queryRunner.query(`CREATE TYPE "public"."compras_estado_enum_old" AS ENUM('PENDIENTE_PAGO', 'PAGADO', 'RECIBIDO', 'CANCELADO')`);
        await queryRunner.query(`ALTER TABLE "compras" ALTER COLUMN "estado" DROP DEFAULT`);
        await queryRunner.query(`
            ALTER TABLE "compras"
            ALTER COLUMN "estado"
            TYPE "public"."compras_estado_enum_old"
            USING "estado"::text::"public"."compras_estado_enum_old"
        `);
        await queryRunner.query(`ALTER TABLE "compras" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE_PAGO'`);
        await queryRunner.query(`DROP TYPE "public"."compras_estado_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."compras_estado_enum_old" RENAME TO "compras_estado_enum"`);

        // Revertir cambios de la tabla producto_lista_precios
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_a44030885de8046a0a08650646d" PRIMARY KEY ("producto_id", "lista_precios_id", "id")`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "precio_venta_especifico"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_a44030885de8046a0a08650646d"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1" PRIMARY KEY ("producto_id", "lista_precios_id")`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "precio_venta_especifico" numeric(10,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bc9af6033b3462afefe9b1e294" ON "producto_lista_precios" ("producto_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_4ff0544939ce1c8797b0c85734" ON "producto_lista_precios" ("lista_precios_id")`);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"
            FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"
            FOREIGN KEY ("lista_precios_id") REFERENCES "lista_precios"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }
}
