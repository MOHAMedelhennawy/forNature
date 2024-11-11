/*
  Warnings:

  - A unique constraint covering the columns `[product_id]` on the table `Wishlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_product_id_key" ON "Wishlist"("product_id");
