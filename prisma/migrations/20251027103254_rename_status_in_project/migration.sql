/*
  Warnings:

  - You are about to drop the column `section` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "section",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'backlog';
