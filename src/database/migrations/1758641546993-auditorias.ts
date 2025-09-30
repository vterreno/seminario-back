import { MigrationInterface, QueryRunner } from "typeorm";

export class Auditorias1758641546993 implements MigrationInterface {
    name = 'Auditorias1758641546993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."movimiento-stock_tipo_movimiento_enum" AS ENUM('STOCK_APERTURA', 'VENTA', 'COMPRA', 'AJUSTE_MANUAL')`);
        await queryRunner.query(`CREATE TABLE "movimiento-stock" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "fecha" TIMESTAMP NOT NULL, "tipo_movimiento" "public"."movimiento-stock_tipo_movimiento_enum" NOT NULL, "descripcion" character varying NOT NULL, "cantidad" integer NOT NULL, "stock_resultante" integer NOT NULL, "empresa_id" integer NOT NULL, "producto_id" integer NOT NULL, CONSTRAINT "PK_4184090d25a4476f93557f6c3bf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ADD CONSTRAINT "FK_6ad1654ba8c7192ffb33fb23538" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" ADD CONSTRAINT "FK_014700f8b783fad11b4a3e21533" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movimiento-stock" DROP CONSTRAINT "FK_014700f8b783fad11b4a3e21533"`);
        await queryRunner.query(`ALTER TABLE "movimiento-stock" DROP CONSTRAINT "FK_6ad1654ba8c7192ffb33fb23538"`);
        await queryRunner.query(`DROP TABLE "movimiento-stock"`);
        await queryRunner.query(`DROP TYPE "public"."movimiento-stock_tipo_movimiento_enum"`);
    }

}
