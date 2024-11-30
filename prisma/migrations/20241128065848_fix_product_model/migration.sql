/*
  Warnings:

  - You are about to alter the column `name` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(20)`.
  - You are about to alter the column `description` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2000)`.
  - You are about to alter the column `summary` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "name" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "image" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(2000),
ALTER COLUMN "summary" SET DATA TYPE VARCHAR(100);
