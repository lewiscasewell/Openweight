/*
  Warnings:

  - You are about to drop the column `weightUnit` on the `Weight` table. All the data in the column will be lost.
  - Added the required column `date` to the `Weight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Weight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Weight" DROP COLUMN "weightUnit",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL;
