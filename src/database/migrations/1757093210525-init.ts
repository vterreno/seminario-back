import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757093210525 implements MigrationInterface {
    name = 'Init1757093210525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_f7a79f991bd7319aef158bfbd38"`);
        await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "empresa_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_f7a79f991bd7319aef158bfbd38" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_f7a79f991bd7319aef158bfbd38"`);
        await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "empresa_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_f7a79f991bd7319aef158bfbd38" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
