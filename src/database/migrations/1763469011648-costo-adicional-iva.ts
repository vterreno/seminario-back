import { MigrationInterface, QueryRunner } from "typeorm";

export class CostoAdicionalIva1763469011648 implements MigrationInterface {
    name = 'CostoAdicionalIva1763469011648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "movimiento-stock" DROP CONSTRAINT "FK_movimiento_stock_sucursal"
        `);
        await queryRunner.query(`
            ALTER TABLE "productos" DROP CONSTRAINT "FK_productos_sucursal"
        `);
        await queryRunner.query(`
            ALTER TABLE "ciudades" DROP CONSTRAINT "FK_ciudades_provincia"
        `);
        await queryRunner.query(`
            ALTER TABLE "contactos" DROP CONSTRAINT "FK_contactos_ciudad"
        `);
        await queryRunner.query(`
            ALTER TABLE "contactos" DROP CONSTRAINT "FK_contactos_provincia"
        `);
        await queryRunner.query(`
            ALTER TABLE "contactos" DROP CONSTRAINT "FK_contactos_empresa"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"
        `);
        await queryRunner.query(`
            ALTER TABLE "usuarios_sucursales" DROP CONSTRAINT "FK_usuarios_sucursales_sucursal"
        `);
        await queryRunner.query(`
            ALTER TABLE "usuarios_sucursales" DROP CONSTRAINT "FK_usuarios_sucursales_usuario"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_bc9af6033b3462afefe9b1e294"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4ff0544939ce1c8797b0c85734"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_unique_producto_proveedor"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_contactos_identificacion"
        `);
        await queryRunner.query(`
            CREATE TABLE "costos-adicionales" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "concepto" character varying(255),
                "monto" numeric(10, 2) NOT NULL,
                "compra_id" integer NOT NULL,
                CONSTRAINT "PK_bf4e60ed0bf44f7ed852c926003" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" DROP COLUMN "created_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" DROP COLUMN "updated_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" DROP COLUMN "deleted_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" DROP COLUMN "precio_venta_especifico"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD "deleted_at" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD "precio_venta_especifico" numeric(10, 2) NOT NULL DEFAULT 0
        `);
        await queryRunner.query(`
            ALTER TABLE "detalle_compra"
            ADD "iva_porcentaje" numeric(5, 2) NOT NULL DEFAULT '21'
        `);
        await queryRunner.query(`
            ALTER TABLE "detalle_compra"
            ADD "iva_monto" numeric(10, 2) NOT NULL DEFAULT 0
        `);
        await queryRunner.query(`
            ALTER TABLE "movimiento-stock"
            ALTER COLUMN "tipo_movimiento"
            SET DEFAULT 'STOCK_APERTURA'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bc9af6033b3462afefe9b1e294" ON "producto_lista_precios" ("producto_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4ff0544939ce1c8797b0c85734" ON "producto_lista_precios" ("lista_precios_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "movimiento-stock"
            ADD CONSTRAINT "FK_f87224555c4e7a154a4db2baf1f" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD CONSTRAINT "FK_4ff0544939ce1c8797b0c857344" FOREIGN KEY ("lista_precios_id") REFERENCES "lista_precios"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "productos"
            ADD CONSTRAINT "FK_65f8d9b1e2bf86529509b8698d6" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "costos-adicionales"
            ADD CONSTRAINT "FK_b85a68e9466f31a12e996d1efda" FOREIGN KEY ("compraId") REFERENCES "compras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "compras"
            ADD CONSTRAINT "FK_9fd7bf301ee04a104d2f0ce2fbe" FOREIGN KEY ("pago_id") REFERENCES "pagos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "ciudades"
            ADD CONSTRAINT "FK_f8fde174d0faa2d4d60f79715fa" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "contactos"
            ADD CONSTRAINT "FK_3ca923c9a0f1cf8f743b34d1b8c" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "contactos"
            ADD CONSTRAINT "FK_59b906170b894a5c2f08ac044c9" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "contactos"
            ADD CONSTRAINT "FK_cdbe481bcf87c4fe1a71f491f76" FOREIGN KEY ("ciudad_id") REFERENCES "ciudades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "usuarios_sucursales"
            ADD CONSTRAINT "FK_0eae05ece551fd97f1842832814" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "usuarios_sucursales"
            ADD CONSTRAINT "FK_6c54354fd145c10062f98b15810" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "usuarios_sucursales" DROP CONSTRAINT "FK_6c54354fd145c10062f98b15810"
        `);
        await queryRunner.query(`
            ALTER TABLE "usuarios_sucursales" DROP CONSTRAINT "FK_0eae05ece551fd97f1842832814"
        `);
        await queryRunner.query(`
            ALTER TABLE "contactos" DROP CONSTRAINT "FK_cdbe481bcf87c4fe1a71f491f76"
        `);
        await queryRunner.query(`
            ALTER TABLE "contactos" DROP CONSTRAINT "FK_59b906170b894a5c2f08ac044c9"
        `);
        await queryRunner.query(`
            ALTER TABLE "contactos" DROP CONSTRAINT "FK_3ca923c9a0f1cf8f743b34d1b8c"
        `);
        await queryRunner.query(`
            ALTER TABLE "ciudades" DROP CONSTRAINT "FK_f8fde174d0faa2d4d60f79715fa"
        `);
        await queryRunner.query(`
            ALTER TABLE "compras" DROP CONSTRAINT "FK_9fd7bf301ee04a104d2f0ce2fbe"
        `);
        await queryRunner.query(`
            ALTER TABLE "costos-adicionales" DROP CONSTRAINT "FK_b85a68e9466f31a12e996d1efda"
        `);
        await queryRunner.query(`
            ALTER TABLE "productos" DROP CONSTRAINT "FK_65f8d9b1e2bf86529509b8698d6"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_4ff0544939ce1c8797b0c857344"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" DROP CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948"
        `);
        await queryRunner.query(`
            ALTER TABLE "movimiento-stock" DROP CONSTRAINT "FK_f87224555c4e7a154a4db2baf1f"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4ff0544939ce1c8797b0c85734"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_bc9af6033b3462afefe9b1e294"
        `);
        await queryRunner.query(`
            ALTER TABLE "movimiento-stock"
            ALTER COLUMN "tipo_movimiento" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "detalle_compra" DROP COLUMN "iva_monto"
        `);
        await queryRunner.query(`
            ALTER TABLE "detalle_compra" DROP COLUMN "iva_porcentaje"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" DROP COLUMN "precio_venta_especifico"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" DROP COLUMN "deleted_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" DROP COLUMN "updated_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios" DROP COLUMN "created_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD "precio_venta_especifico" numeric(10, 2) NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD "deleted_at" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            DROP TABLE "costos-adicionales"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_contactos_identificacion" ON "contactos" (
                "empresa_id",
                "numero_identificacion",
                "tipo_identificacion"
            )
            WHERE (
                    (tipo_identificacion IS NOT NULL)
                    AND (numero_identificacion IS NOT NULL)
                )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_unique_producto_proveedor" ON "producto_proveedor" ("producto_id", "proveedor_id")
            WHERE (deleted_at IS NULL)
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4ff0544939ce1c8797b0c85734" ON "producto_lista_precios" ("lista_precios_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bc9af6033b3462afefe9b1e294" ON "producto_lista_precios" ("producto_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "usuarios_sucursales"
            ADD CONSTRAINT "FK_usuarios_sucursales_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "usuarios_sucursales"
            ADD CONSTRAINT "FK_usuarios_sucursales_sucursal" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD CONSTRAINT "FK_bc9af6033b3462afefe9b1e2948" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "producto_lista_precios"
            ADD CONSTRAINT "FK_4ff0544939ce1c8797b0c857344" FOREIGN KEY ("lista_precios_id") REFERENCES "lista_precios"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "contactos"
            ADD CONSTRAINT "FK_contactos_empresa" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "contactos"
            ADD CONSTRAINT "FK_contactos_provincia" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "contactos"
            ADD CONSTRAINT "FK_contactos_ciudad" FOREIGN KEY ("ciudad_id") REFERENCES "ciudades"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "ciudades"
            ADD CONSTRAINT "FK_ciudades_provincia" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "productos"
            ADD CONSTRAINT "FK_productos_sucursal" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "movimiento-stock"
            ADD CONSTRAINT "FK_movimiento_stock_sucursal" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
