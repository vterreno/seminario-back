import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoriasTableAndUpdateConstraints1758645834475 implements MigrationInterface {
    name = 'CreateCategoriasTableAndUpdateConstraints1758645834475'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categorias" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "nombre" character varying NOT NULL, "descripcion" character varying, "estado" boolean NOT NULL DEFAULT true, "empresa_id" integer, CONSTRAINT "UQ_692c9aed167a494d2205382ebb5" UNIQUE ("nombre", "empresa_id"), CONSTRAINT "PK_3886a26251605c571c6b4f861fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "categorias" ADD CONSTRAINT "FK_f4653d9281a77dc8918ab07c31c" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categorias" DROP CONSTRAINT "FK_f4653d9281a77dc8918ab07c31c"`);
        await queryRunner.query(`DROP TABLE "categorias"`);
    }

}
