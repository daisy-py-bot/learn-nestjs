import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCourseCategories1700000000000 implements MigrationInterface {
  name = 'CreateCourseCategories1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the course_categories table
    await queryRunner.query(`
      CREATE TABLE "course_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "icon" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "order" integer NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_course_categories_name" UNIQUE ("name"),
        CONSTRAINT "PK_course_categories" PRIMARY KEY ("id")
      )
    `);

    // Insert default categories
    await queryRunner.query(`
      INSERT INTO "course_categories" ("name", "description", "order") VALUES
      ('Career Skills', 'Skills for professional development', 1),
      ('Money Matters', 'Financial literacy and management', 2),
      ('Communication Skills', 'Effective communication techniques', 3),
      ('Digital Tools', 'Technology and digital skills', 4),
      ('Personal Growth', 'Self-improvement and development', 5),
      ('Interviews', 'Interview preparation and techniques', 6),
      ('Leadership', 'Leadership and management skills', 7),
      ('Teamwork & Collaboration', 'Working effectively in teams', 8),
      ('Time Management', 'Productivity and time organization', 9),
      ('Emotional Intelligence', 'EQ and interpersonal skills', 10),
      ('Critical Thinking', 'Analytical and reasoning skills', 11),
      ('Problem Solving', 'Creative problem-solving approaches', 12),
      ('Creativity', 'Innovation and creative thinking', 13),
      ('Learning Strategies', 'Effective learning methods', 14)
    `);

    // Add categoryId column to courses table
    await queryRunner.query(`
      ALTER TABLE "courses" ADD "categoryId" uuid
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "courses" ADD CONSTRAINT "FK_courses_category" 
      FOREIGN KEY ("categoryId") REFERENCES "course_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Update existing courses to use the first category as default
    await queryRunner.query(`
      UPDATE "courses" SET "categoryId" = (
        SELECT "id" FROM "course_categories" WHERE "name" = 'Career Skills' LIMIT 1
      ) WHERE "categoryId" IS NULL
    `);

    // Make categoryId NOT NULL after setting defaults
    await queryRunner.query(`
      ALTER TABLE "courses" ALTER COLUMN "categoryId" SET NOT NULL
    `);

    // Drop the old category enum column
    await queryRunner.query(`
      ALTER TABLE "courses" DROP COLUMN "category"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the old category enum column
    await queryRunner.query(`
      ALTER TABLE "courses" ADD "category" character varying NOT NULL DEFAULT 'Career Skills'
    `);

    // Drop the foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_category"
    `);

    // Drop the categoryId column
    await queryRunner.query(`
      ALTER TABLE "courses" DROP COLUMN "categoryId"
    `);

    // Drop the course_categories table
    await queryRunner.query(`
      DROP TABLE "course_categories"
    `);
  }
} 