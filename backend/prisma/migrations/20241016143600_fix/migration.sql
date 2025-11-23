/*
  Warnings:

  - Changed the type of `phone_number` on the `user` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "phone_number",
ADD COLUMN     "phone_number" INTEGER NOT NULL;
