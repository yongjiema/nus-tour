import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultToUnhashedPasswordColumn1732109901401 implements MigrationInterface {
  name = 'AddDefaultToUnhashedPasswordColumn1732109901401';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "role" TO "unhashedPassword"`);
    await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_unhashedpassword_enum"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "unhashedPassword"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "unhashedPassword" character varying NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "unhashedPassword"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "unhashedPassword" "public"."user_unhashedpassword_enum" NOT NULL DEFAULT 'user'`,
    );
    await queryRunner.query(`ALTER TYPE "public"."user_unhashedpassword_enum" RENAME TO "user_role_enum"`);
    await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "unhashedPassword" TO "role"`);
  }
}
