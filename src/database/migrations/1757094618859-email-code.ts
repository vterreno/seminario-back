import { MigrationInterface, QueryRunner } from "typeorm";

export class EmailCode1757094618859 implements MigrationInterface {
    name = 'EmailCode1757094618859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email-code" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "expired_at" TIMESTAMP NOT NULL, "codigoHash" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_0cd250fc31874cb6613caad72a2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "email-code"`);
    }

}
