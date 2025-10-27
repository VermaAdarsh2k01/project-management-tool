/*
  Warnings:

  - You are about to drop the column `labels` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `leadId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `Milestone` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Milestone" DROP CONSTRAINT "Milestone_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_leadId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "labels",
DROP COLUMN "leadId";

-- DropTable
DROP TABLE "public"."Milestone";
