import { MigrationInterface, QueryRunner } from "typeorm";

export class createFarmModel1678038276941 implements MigrationInterface {
    name = "createFarmModel1678038276941"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "farm" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "size" numeric(5,1) NOT NULL, "yield" numeric(5,1) NOT NULL, "coordinates" geometry(Point,4326) NOT NULL, "address" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "UQ_11527b5b142bb3e07f87d459802" UNIQUE ("name"), CONSTRAINT "PK_3bf246b27a3b6678dfc0b7a3f64" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_11527b5b142bb3e07f87d45980" ON "farm" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_ce8ec32d62986bc2bc68126a2a" ON "farm" USING GiST ("coordinates") `);
        await queryRunner.query(`ALTER TABLE "farm" ADD CONSTRAINT "FK_fe2fe67c9ca2dc03fff76cd04a9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "farm" DROP CONSTRAINT "FK_fe2fe67c9ca2dc03fff76cd04a9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce8ec32d62986bc2bc68126a2a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_11527b5b142bb3e07f87d45980"`);
        await queryRunner.query(`DROP TABLE "farm"`);
    }

}
