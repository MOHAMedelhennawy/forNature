/*
  Warnings:

  - A unique constraint covering the columns `[product_id]` on the table `CartItems` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CartItems_product_id_key" ON "CartItems"("product_id");
