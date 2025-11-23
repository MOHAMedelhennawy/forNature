/*
  Warnings:

  - Added the required column `total_cost` to the `CartItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CartItems" ADD COLUMN     "total_cost" INTEGER NOT NULL;
