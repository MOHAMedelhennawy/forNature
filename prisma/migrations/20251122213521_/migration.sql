-- DropForeignKey
ALTER TABLE "CartItems" DROP CONSTRAINT "CartItems_cart_id_fkey";

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
