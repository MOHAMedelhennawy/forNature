import {
    fetchCartItems,
    fetchWishlistItems,
    fetchDeleteWishlistItem,
} from '/javascript/api/category.js'

import { renderWishlistItems } from '/javascript/components/wishlist.js';
import { renderUserCart, handleQuantityButtonsClick, removeFromCart} from '/javascript/components/cart.js';

document.addEventListener('DOMContentLoaded', async function () {

    const { allCartItems, cart } = await fetchCartItems();
    const wishlistItems = await fetchWishlistItems();


    await renderUserCart(allCartItems);
    await renderWishlistItems(wishlistItems);
    await addEventListeners2(cart);
});

async function addEventListeners2(cart) {
    let cartIsVisible = false;
    let wishlistIsVisible = false;
    const cartElement = document.querySelector('.cart-link');
    const cartContainer = document.querySelector('.cart-container');
    const cartContent = document.querySelector('.cart-content');
    const wishlistElement = document.querySelector('.wishlist-link');
    const wishlistContainer = document.querySelector('.wishlist-container');
    const cartButton = document.querySelector('.cart-button');

    cartElement.addEventListener('click', () => {
        if (cartIsVisible) {
            cartContainer.style.width = '0';
        } else {
            cartContainer.style.width = '25rem';
            if (wishlistIsVisible) {
                wishlistContainer.style.width = '0';
                wishlistIsVisible = !wishlistIsVisible;
            }
    
        }

        cartIsVisible = !cartIsVisible;
    })

    wishlistElement.addEventListener('click', () => {
        if (wishlistIsVisible) {
            wishlistContainer.style.width = '0';
        } else {
            wishlistContainer.style.width = '25rem';
            if (cartIsVisible) {
                cartContainer.style.width = '0';
                cartIsVisible = !cartIsVisible
            }
        }

        wishlistIsVisible = !wishlistIsVisible;
    })

    cartContent.addEventListener('click', async (event) => {
        const quantityButton = event.target.closest('.decrease-quantity, .increase-quantity');
        const deleteBtn = event.target.closest('.delete-btn.cart');
        
        if (quantityButton) {
            await handleQuantityButtonsClick(quantityButton);
        } else if (deleteBtn) {
            const cartItemElement = deleteBtn.closest('.cart-item');
            const id = cartItemElement.dataset.cartItemId;
            const quantity = cartItemElement.querySelector('.quantity').innerText;
            const price = cartItemElement.querySelector('.price').innerText;
            const totalPrice = parseFloat(quantity) * parseFloat(price);

            await removeFromCart(id, totalPrice);
        }
    })

    cartButton.addEventListener('click', async (event) => {
        const cartContent = cartButton.closest('.cart-container');

        const response = await fetch('/api/v1/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            location.reload();
        }
    })

    wishlistContainer.addEventListener('click', async (event) => {
        const deleteWishlistBtn = event.target.closest('.delete-wishlist-btn');
        if (deleteWishlistBtn) {
            const wishlistItem = deleteWishlistBtn.closest('.wishlist-item');
            const id = wishlistItem.dataset.wishlistItemId;

            const { deletedItem } = await fetchDeleteWishlistItem(id);

            if (deletedItem) {
                const productGrid = document.querySelector('.product-grid, .prod-container');

                if (productGrid) {
                    const product = productGrid.querySelector(`.product-item[data-wishlist-item-id="${id}"]`);

                    if (product) {
                        const favorateIcon = product.querySelector(".material-icons");
                        favorateIcon.style.color = 'black';
                    }

                }
                wishlistItem.remove();
            }
        }
    })
}
