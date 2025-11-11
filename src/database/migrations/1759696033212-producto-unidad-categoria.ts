import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductoUnidadCategoria1759696033212 implements MigrationInterface {
    name = 'ProductoUnidadCategoria1759696033212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "productos" ADD "categoria_id" integer`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_5aaee6054b643e7c778477193a3" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_5aaee6054b643e7c778477193a3"`);
        await queryRunner.query(`ALTER TABLE "productos" DROP COLUMN "categoria_id"`);
    }

}
