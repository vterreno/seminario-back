import { MigrationInterface, QueryRunner } from "typeorm";

export class Compra1762889568108 implements MigrationInterface {
    name = 'Compra1762889568108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movimiento-stock" DROP CONSTRAINT "FK_movimiento_stock_sucursal"`);
        await queryRunner.query(`ALTER TABLE "unidades_medida" DROP CONSTRAINT "FK_unidades_medida_empresa"`);
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_productos_sucursal"`);
        await queryRunner.query(`ALTER TABLE "ciudades" DROP CONSTRAINT "FK_ciudades_provincia"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_contactos_ciudad"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_contactos_provincia"`);
        await queryRunner.query(`ALTER TABLE "contactos" DROP CONSTRAINT "FK_contactos_empresa"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"`);
        await queryRunner.query(`ALTER TABLE "usuarios_sucursales" DROP CONSTRAINT "FK_usuarios_sucursales_sucursal"`);
        await queryRunner.query(`ALTER TABLE "usuarios_sucursales" DROP CONSTRAINT "FK_usuarios_sucursales_usuario"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc9af6033b3462afefe9b1e294"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ff0544939ce1c8797b0c85734"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_unidades_medida_nombre_empresa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_unidades_medida_abreviatura_empresa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_usuarios_sucursales_usuario_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_usuarios_sucursales_sucursal_id"`);

        await queryRunner.query(`CREATE TABLE "producto_proveedor" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "producto_id" integer NOT NULL, "proveedor_id" integer NOT NULL, "precio_proveedor" numeric(10,2) NOT NULL, "codigo_proveedor" character varying, CONSTRAINT "PK_9d7eb17b15ec2971a26f48a8329" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "detalle_compra" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "cantidad" integer NOT NULL, "precio_unitario" numeric(10,2) NOT NULL, "subtotal" numeric(10,2) NOT NULL, "producto_proveedor_id" integer, "compra_id" integer, CONSTRAINT "PK_51069b2e39319e34986637f364a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."compras_estado_enum" AS ENUM('PENDIENTE_PAGO', 'PAGADO', 'RECIBIDO', 'CANCELADO')`);
        await queryRunner.query(`CREATE TABLE "compras" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "numero_compra" integer NOT NULL, "fecha_compra" TIMESTAMP NOT NULL, "monto_total" numeric(10,2) NOT NULL, "estado" "public"."compras_estado_enum" NOT NULL DEFAULT 'PENDIENTE_PAGO', "contacto_id" integer, "sucursal_id" integer, CONSTRAINT "PK_63037d5249eefe140e3587ff6f2" PRIMARY KEY ("id"))`);

        await queryRunner.query(`ALTER TABLE "unidades_medida" DROP COLUMN "productos_id"`);
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

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD "precio_venta_especifico" numeric(10,2)`);
        await queryRunner.query(`UPDATE "producto_lista_precios" SET "precio_venta_especifico" = 0 WHERE "precio_venta_especifico" IS NULL`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ALTER COLUMN "precio_venta_especifico" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "PK_a44030885de8046a0a08650646d"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "PK_5a0c09978b089c2479350ccbdf1" PRIMARY KEY ("producto_id", "lista_precios_id")`);

        await queryRunner.query(`ALTER TABLE "sucursales" ALTER COLUMN "numero_venta" SET DEFAULT '0'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_842a2d613bb95917252ef186a2" ON "unidades_medida" ("abreviatura", "empresa_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a9b659026f7f0a140111a57bb5" ON "unidades_medida" ("nombre", "empresa_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc9af6033b3462afefe9b1e294" ON "producto_lista_precios" ("producto_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4ff0544939ce1c8797b0c85734" ON "producto_lista_precios" ("lista_precios_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_0eae05ece551fd97f184283281" ON "usuarios_sucursales" ("usuario_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6c54354fd145c10062f98b1581" ON "usuarios_sucursales" ("sucursal_id") `);

        await queryRunner.query(`ALTER TABLE "movimiento-stock" ADD CONSTRAINT "FK_f87224555c4e7a154a4db2baf1f" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "FK_4ff0544939ce1c8797b0c857344" FOREIGN KEY ("lista_precios_id") REFERENCES "lista_precios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unidades_medida" ADD CONSTRAINT "FK_3e76b73ba043e1cb531b8a4cec8" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_65f8d9b1e2bf86529509b8698d6" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "producto_proveedor" ADD CONSTRAINT "FK_7587673df9ed2964d7fa4a24124" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "producto_proveedor" ADD CONSTRAINT "FK_9e66fbc60135bb0a2b5d45cbb4f" FOREIGN KEY ("proveedor_id") REFERENCES "contactos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "detalle_compra" ADD CONSTRAINT "FK_bc15e628e458709b3cdcd5fb254" FOREIGN KEY ("producto_proveedor_id") REFERENCES "producto_proveedor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "detalle_compra" ADD CONSTRAINT "FK_a55bfe2df79c68ba54b0bfbd331" FOREIGN KEY ("compra_id") REFERENCES "compras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "compras" ADD CONSTRAINT "FK_b7b22a54d4d4ae571ae8a2baca3" FOREIGN KEY ("contacto_id") REFERENCES "contactos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "compras" ADD CONSTRAINT "FK_a7d0e71af5f2dd38d5f2f3855f3" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios_sucursales" ADD CONSTRAINT "FK_0eae05ece551fd97f1842832814" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "usuarios_sucursales" ADD CONSTRAINT "FK_6c54354fd145c10062f98b15810" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "usuarios_sucursales" DROP CONSTRAINT "FK_6c54354fd145c10062f98b15810"`);
        await queryRunner.query(`ALTER TABLE "usuarios_sucursales" DROP CONSTRAINT "FK_0eae05ece551fd97f1842832814"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP CONSTRAINT "FK_a7d0e71af5f2dd38d5f2f3855f3"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP CONSTRAINT "FK_b7b22a54d4d4ae571ae8a2baca3"`);
        await queryRunner.query(`ALTER TABLE "detalle_compra" DROP CONSTRAINT "FK_a55bfe2df79c68ba54b0bfbd331"`);
        await queryRunner.query(`ALTER TABLE "detalle_compra" DROP CONSTRAINT "FK_bc15e628e458709b3cdcd5fb254"`);
        await queryRunner.query(`ALTER TABLE "producto_proveedor" DROP CONSTRAINT "FK_9e66fbc60135bb0a2b5d45cbb4f"`);
        await queryRunner.query(`ALTER TABLE "producto_proveedor" DROP CONSTRAINT "FK_7587673df9ed2964d7fa4a24124"`);
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_65f8d9b1e2bf86529509b8698d6"`);
        await queryRunner.query(`ALTER TABLE "unidades_medida" DROP CONSTRAINT "FK_3e76b73ba043e1cb531b8a4cec8"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" DROP CONSTRAINT "FK_f87224555c4e7a154a4db2baf1f"`);

        await queryRunner.query(`DROP INDEX "public"."IDX_6c54354fd145c10062f98b1581"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0eae05ece551fd97f184283281"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ff0544939ce1c8797b0c85734"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc9af6033b3462afefe9b1e294"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9b659026f7f0a140111a57bb5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_842a2d613bb95917252ef186a2"`);

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

        await queryRunner.query(`ALTER TABLE "unidades_medida" ADD "productos_id" character varying`);
        await queryRunner.query(`DROP TABLE "compras"`);
        await queryRunner.query(`DROP TYPE "public"."compras_estado_enum"`);
        await queryRunner.query(`DROP TABLE "detalle_compra"`);
        await queryRunner.query(`DROP TABLE "producto_proveedor"`);

        await queryRunner.query(`CREATE INDEX "IDX_usuarios_sucursales_sucursal_id" ON "usuarios_sucursales" ("sucursal_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_usuarios_sucursales_usuario_id" ON "usuarios_sucursales" ("usuario_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_unidades_medida_abreviatura_empresa" ON "unidades_medida" ("abreviatura", "empresa_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_unidades_medida_nombre_empresa" ON "unidades_medida" ("empresa_id", "nombre") `);
        await queryRunner.query(`CREATE INDEX "IDX_4ff0544939ce1c8797b0c85734" ON "producto_lista_precios" ("lista_precios_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc9af6033b3462afefe9b1e294" ON "producto_lista_precios" ("producto_id") `);

        await queryRunner.query(`ALTER TABLE "usuarios_sucursales" ADD CONSTRAINT "FK_usuarios_sucursales_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios_sucursales" ADD CONSTRAINT "FK_usuarios_sucursales_sucursal" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "producto_lista_precios" ADD CONSTRAINT "FK_4ff0544939ce1c8797b0c857344" FOREIGN KEY ("lista_precios_id") REFERENCES "lista_precios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_empresa" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_provincia" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contactos" ADD CONSTRAINT "FK_contactos_ciudad" FOREIGN KEY ("ciudad_id") REFERENCES "ciudades"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ciudades" ADD CONSTRAINT "FK_ciudades_provincia" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_productos_sucursal" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unidades_medida" ADD CONSTRAINT "FK_unidades_medida_empresa" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ADD CONSTRAINT "FK_movimiento_stock_sucursal" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
