/*
  Warnings:

  - You are about to alter the column `total_price` on the `CartItems` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - Added the required column `unit_price` to the `CartItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `CartItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CartItems" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "unit_price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1,
ALTER COLUMN "total_price" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "CartItems_cart_id_idx" ON "CartItems"("cart_id");

-- CreateIndex
CREATE INDEX "CartItems_product_id_idx" ON "CartItems"("product_id");
