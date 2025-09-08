import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToUsers1757385600000 implements MigrationInterface {
    name = 'AddStatusToUsers1757385600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add status column to usuarios table
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "status" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove status column from usuarios table
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "status"`);
    }
}
