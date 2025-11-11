import { MigrationInterface, QueryRunner } from "typeorm";

export class Ventas1759772802398 implements MigrationInterface {
    name = 'Ventas1759772802398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pagos" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "fecha_pago" TIMESTAMP NOT NULL, "monto_pago" numeric(10,2) NOT NULL, "metodo_pago" character varying NOT NULL, "sucursalId" integer, CONSTRAINT "PK_37321ca70a2ed50885dc205beb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "detalle_venta" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "cantidad" integer NOT NULL, "precio_unitario" numeric(10,2) NOT NULL, "subtotal" numeric(10,2) NOT NULL, "producto_id" integer, "venta_id" integer, CONSTRAINT "PK_15e83370f604ee4b71e7299514e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ventas" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "numero_venta" integer NOT NULL, "fecha_venta" TIMESTAMP NOT NULL, "monto_total" numeric(10,2) NOT NULL, "contacto_id" integer, "sucursal_id" integer, "pago_id" integer, CONSTRAINT "REL_71a678ec3782f7eabef32eac1f" UNIQUE ("pago_id"), CONSTRAINT "PK_b8b73abe8561829c019531d9a2e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sucursales" ADD "numero_venta" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ALTER COLUMN "tipo_movimiento" SET DEFAULT 'STOCK_APERTURA'`);
        await queryRunner.query(`ALTER TABLE "pagos" ADD CONSTRAINT "FK_a2450af77241f9549d58da0c61b" FOREIGN KEY ("sucursalId") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "detalle_venta" ADD CONSTRAINT "FK_1ec9a5c8b5c638129f1b4b0e3df" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "detalle_venta" ADD CONSTRAINT "FK_7a19a69d52a6ee8e62f0a1b4103" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ventas" ADD CONSTRAINT "FK_26770be951682d70a2573dc1461" FOREIGN KEY ("contacto_id") REFERENCES "contactos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ventas" ADD CONSTRAINT "FK_3cbcca0e21a79d4b2b2fcb7c273" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ventas" ADD CONSTRAINT "FK_71a678ec3782f7eabef32eac1f3" FOREIGN KEY ("pago_id") REFERENCES "pagos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ventas" DROP CONSTRAINT "FK_71a678ec3782f7eabef32eac1f3"`);
        await queryRunner.query(`ALTER TABLE "ventas" DROP CONSTRAINT "FK_3cbcca0e21a79d4b2b2fcb7c273"`);
        await queryRunner.query(`ALTER TABLE "ventas" DROP CONSTRAINT "FK_26770be951682d70a2573dc1461"`);
        await queryRunner.query(`ALTER TABLE "detalle_venta" DROP CONSTRAINT "FK_7a19a69d52a6ee8e62f0a1b4103"`);
        await queryRunner.query(`ALTER TABLE "detalle_venta" DROP CONSTRAINT "FK_1ec9a5c8b5c638129f1b4b0e3df"`);
        await queryRunner.query(`ALTER TABLE "pagos" DROP CONSTRAINT "FK_a2450af77241f9549d58da0c61b"`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ALTER COLUMN "tipo_movimiento" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sucursales" DROP COLUMN "numero_venta"`);
        await queryRunner.query(`DROP TABLE "ventas"`);
        await queryRunner.query(`DROP TABLE "detalle_venta"`);
        await queryRunner.query(`DROP TABLE "pagos"`);
    }
}
