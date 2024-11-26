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
                const productGrid = document.querySelector('.product-grid');
                const product = productGrid.querySelector(`.product-item[data-wishlist-item-id="${id}"]`);
                if (product) {
                    const favorateIcon = product.querySelector(".material-icons");
                    favorateIcon.style.color = 'black';
                }
                wishlistItem.remove();
            }
        }
    })
}

async function fetchCartItems() {
    const response = await fetch('/api/cart');

    return response.ok ? await response.json() : [];
}

async function fetchWishlistItems() {
    const response = await fetch('/api/v1/wishlist');

    return response.ok ? await response.json() : [];
}

async function fetchProductById(id) {
    const response = await fetch(`/api/products/${id}`);

    if (!response.ok) console.error(`Failed to get product with ${id}`);

    return response.json();
}

async function renderUserCart(userCartItems) {
    const cartContent = document.querySelector('.cart-content');
    const cartItemElement = cartContent.querySelector('.cart-item');

    if (Array.isArray(userCartItems)) {
        for (const item of userCartItems) {
            await addCartItemsToCartInUi(item, cartContent, cartItemElement);
        }
    }
}

async function renderWishlistItems(wishlistItems) {
    const wishlistContent = document.querySelector('.wishlist-content');
    const wishlistItemElement = document.querySelector('.wishlist-item');

    for (const item of wishlistItems) {
        if (Array.isArray(wishlistItems)) {
            await addWishlistItemToWihslistUi(item, wishlistContent, wishlistItemElement);
        }
    }
}

async function addCartItemsToCartInUi(item, cartContent, cartItemElement) {
    const newCartItem = cartItemElement.cloneNode(true);
    const cartImg = newCartItem.querySelector('.cart-img img');
    const cartName = newCartItem.querySelector('.cart-name');
    const cartSummery = newCartItem.querySelector('.cart-summery');
    const cartQuantity = newCartItem.querySelector('.quantity-btn.cart .quantity');
    const cartPrice = newCartItem.querySelector('.price');
    const product = await fetchProductById(item.product_id);
    newCartItem.dataset.cartItemId = item.id;

    cartImg.src = `images/${product.image}`;
    cartName.innerText = product.name;
    cartSummery.innerText = product.summary;
    cartQuantity.innerText = item.quantity;
    cartPrice.innerText = product.price;
    newCartItem.style.display = 'flex';

    cartContent.appendChild(newCartItem);
}

async function addWishlistItemToWihslistUi(item, wishlistContent, wishlistItemElement) {
    const newWishlistItem = wishlistItemElement.cloneNode(true);
    const wishlistImg = newWishlistItem.querySelector('.wishlist-img img');
    const wishlistName = newWishlistItem.querySelector('.wishlist-name');
    const wishlistSummery = newWishlistItem.querySelector('.wishlist-summery');
    const wishlistPrice = newWishlistItem.querySelector('.price');
    const product = await fetchProductById(item.product_id);
    newWishlistItem.dataset.wishlistItemId = item.id;

    wishlistImg.src = `images/${product.image}`;
    wishlistName.innerText = product.name;
    wishlistSummery.innerText = product.summary;
    wishlistPrice.innerText = product.price;
    newWishlistItem.style.display = 'flex';

    wishlistContent.appendChild(newWishlistItem);
}