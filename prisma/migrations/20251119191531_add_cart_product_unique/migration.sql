/*
  Warnings:

  - A unique constraint covering the columns `[cart_id,product_id]` on the table `CartItems` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CartItems_cart_id_product_id_key" ON "CartItems"("cart_id", "product_id");
