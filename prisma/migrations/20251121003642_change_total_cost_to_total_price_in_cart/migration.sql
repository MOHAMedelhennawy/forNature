/*
  Warnings:

  - You are about to drop the column `total_cost` on the `Cart` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "total_cost",
ADD COLUMN     "total_price" DECIMAL(65,30) NOT NULL DEFAULT 0.0;
