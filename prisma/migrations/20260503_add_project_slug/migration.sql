-- AlterTable
ALTER TABLE "Project" ADD COLUMN "slug" TEXT;

-- Populate slug for existing records
UPDATE "Project" SET "slug" = CONCAT('project-', id) WHERE "slug" IS NULL;

-- Make slug required and unique
ALTER TABLE "Project" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Project" ADD CONSTRAINT "Project_slug_key" UNIQUE ("slug");
