/*
  Warnings:

  - You are about to drop the column `total_price` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `total_cost` on the `CartItems` table. All the data in the column will be lost.
  - Added the required column `total_price` to the `CartItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "total_price",
ADD COLUMN     "total_cost" DECIMAL(65,30) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "CartItems" DROP COLUMN "total_cost",
ADD COLUMN     "total_price" INTEGER NOT NULL;
