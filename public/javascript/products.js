document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to get products');

        const data = await response.json();
        if (data && Array.isArray(data.products)) {
            renderProducts(data);
            addEventListeners(data.user);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
});

const renderProducts = async (data) => {
    const productItem = document.querySelector('.product-item');
    const productGrid = document.querySelector('.product-grid');
    productItem.style.display = 'none';

    if (data.user) {
        const cartItemsResponse = await fetch('api/cart')
        const cartItemsResult = await cartItemsResponse.json();
        
        const wishlistResponse = await fetch('api/v1/wishlist');
        const wihslistResult = await wishlistResponse.json();
    }

    for (const product of data.products) {
        const newItem = productItem.cloneNode(true);
        newItem.style.display = 'flex';

        newItem.querySelector('.product-image').src = `images/${product.image}`;
        newItem.querySelector('.product-name h3').textContent = product.name;
        newItem.querySelector('.product-summery').textContent = product.summary;
        newItem.querySelector('.price').textContent = roundTo(product.price, 3);
        newItem.dataset.id = product.id;    // to set id of product on dataset attribute

        if (data.user && cartItemsResult) {
            for (const item of cartItemsResult) {
                if (item.product_id === product.id) {
                    const quantityButton = newItem.querySelector('.quantity-btn');
                    const cartBtn = newItem.querySelector('.cart-btn');
                    const currentQuantity = quantityButton.querySelector('.quantity');
                    newItem.dataset.cartItemId = item.id

                    cartBtn.style.display = 'none';
                    quantityButton.style.display = 'flex';
                    currentQuantity.innerText = item.quantity;
                }
            }

        }

        if (data.user && wihslistResult) {
            for(const item of wihslistResult) {
                if (item.product_id === product.id) {
                    console.log(item.product_id, product.id)
                    const favourateBtn = newItem.querySelector('.favorate-btn i');

                    favourateBtn.style.color = 'red';
                }
            }
        }
        productGrid.appendChild(newItem);
    }
};

async function addEventListeners(user) {
    
    // Use productGrid for event delegation to handle future dynamically added products
    const productGrid = document.querySelector('.product-grid');

    productGrid.addEventListener('click', async (event) => {
        // event.target: The specific element clicked on by the user
        const cartBtn = event.target.closest('.cart-btn');  // Check if the clicked element or its parent is the cart button
        const quantityButton = event.target.closest('.decrease-quantity, .increase-quantity');  // Check if the clicked element is a quantity button (increase or decrease)
        const favourateBtn = event.target.closest('.favorate-btn');

        // Handle adding product to cart, if user click on cartBtn
        if (cartBtn) {
            const productItem = cartBtn.closest('.product-item');  // Get the closest parent with class "product-item"
            const productId = productItem.dataset.id;  // Retrieve product ID from data attribute

            if (user) {  // If the user is logged in, add the product to the cart
                await handleCartButtonClick(productId, cartBtn, productItem);
            } else {
                console.error('Please login and try again');
                window.location.assign('/login');
            }
        } else if (quantityButton) {
            if (user) {
                await handleQuantityButtonsClick(quantityButton);
            } else {
                console.error('Please login and try again');
                window.location.assign('/login');
            }
        } else if (favourateBtn) {
            if (user) {
                const productItem = favourateBtn.closest('.product-item');
                const productId = productItem.dataset.id;
    
                await handleFavourateButtonClick(productId, user.id, favourateBtn);
            } else {
                console.error('Please login and try again');
                window.location.assign('/login');
            }
        }
    })
}

/**
 * Handler function to add or remove item from user wishlist
 * 
 * Its get the item from user wishlist using product id and user id,
 * if the item exist, delete it from wishlist. otherwise, add a new item.
 * 
 * @param {UUID} productId - The id of product
 * @param {UUID} userId - The id of user
 * @param {HTMLElement} favourateBtn - The favourate item element
 */
async function handleFavourateButtonClick(productId, userId, favourateBtn) {
    const responseGetAllWishlist = await fetch(`/api/v1/wishlist?userId=${userId}&productId=${productId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })

    const getAllWishlistResult = await responseGetAllWishlist.json();   // get wishlist item

    if(!getAllWishlistResult) { // if item not fount, add new item to wishlist
        favourateBtn.querySelector('i').style.color = 'red';

        const responsePostWishlist = await fetch('api/v1/wishlist', {
            method: 'POST',
            body: JSON.stringify({
                product_id: productId,
                user_id: userId,
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!responsePostWishlist.ok) {
            console.error('Failed to add item to wishlist');
        }
    } else {    // if wishlist is found, delete it from wishlist
        favourateBtn.querySelector('i').style.color = 'black';

        const responsePostWishlist = await fetch(`api/v1/wishlist/${getAllWishlistResult.id}`, {
            method: 'DELETE',
            body: JSON.stringify({
                product_id: productId,
                user_id: userId,
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!responsePostWishlist.ok) {
            console.error('Failed to delete item from wishlist');
        }
    }

}
/**
 * This function to handle a click on quntity button
 * 
 * @param {HTMLElement} quantityButton
 */
async function handleQuantityButtonsClick(quantityButton) {
    const productItem = quantityButton.closest('.product-item');
    const cartBtn = productItem.querySelector('.cart-btn');
    const quantityElement = productItem.querySelector('.quantity');
    const currentQuantity = parseInt(quantityElement.innerText);  // Current quantity shown
    const increment = quantityButton.classList.contains('increase-quantity') ? 1 : -1;
    const productPrice = productItem.querySelector('.price').innerText;
    const newQuantity = currentQuantity + increment;  // Calculate new quantity
    const cartItemId = productItem.dataset.cartItemId;

    // Only update if the new quantity is 1 or more
    if (newQuantity > 0) {
        console.log(`new quantity is equal to: ${newQuantity}`);
        await updateQuantity(cartItemId, quantityElement, increment, productPrice);
    } else {
        console.log(`new quantity is equal to: ${newQuantity}`);
        await removeFromCart(cartItemId, cartBtn, quantityElement, productPrice);
    }
}

async function removeFromCart(cartItemId, cartBtn, quantityElement, productPrice) {
    const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
        body: JSON.stringify({ price: productPrice }),
        headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
        cartBtn.style.display = 'block';
        quantityElement.parentElement.style.display = 'none';
    } else {
        console.error('Failed to remove item from cart');
    }
}

/**
 * Handle a click event on the 'Add to cart' button.
 * 
 * This function send post request to create new cart item
 * and add this cart item to user cart.
 * 
 * If item successfully created, it hide 'cartBtn' and display 'quanitiy buttons'
 * got change the quantity that user need.
 * 
 * @param {Object} user - The user info (not used yet)
 * @param {UUID} productId - The id of product
 * @param {HTMLElement} cartBtn - The button that add product to user cart
 * @param {HTMLElement} productItem - The product item element containing the cart and quantity buttons.
 */
async function handleCartButtonClick(productId, cartBtn, productItem) {

    const productPrice = productItem.querySelector('.price').innerText;

    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, price: productPrice }),
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();
        console.log(result)

        if (response.ok) {
            cartBtn.style.display = 'none';    
            const quantityButton = productItem.querySelector('.quantity-btn');
            quantityButton.style.display = 'flex';
            productItem.dataset.cartItemId = result.id
        } else {
            console.error('Failed to add product to cart');
        }

    } catch (error) {
        console.error('Error adding product to cart:', error);
    }
}

/**
 * This function send PUT request to change cart item quantity.
 * 
 * If function sends a PUT request successfully, it's change the display of item
 * quantity
 *
 * @param {UUID} cartItemId - The id of cart item to change quantity.
 * @param {HTMLElement} quantityElement - The number of current item quantity that user need.
 * @param {Number} increment - 1 if the user click on increase-btn, otherwise -1
 */
async function updateQuantity(cartItemId, quantityElement, increment, productPrice) {
    const price = parseFloat(productPrice) * increment
    let currentQuantity = Number(quantityElement.innerText);
    currentQuantity = Math.max(0, currentQuantity + increment);
    
    try {
        const response = await fetch(`/api/cart/${cartItemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: currentQuantity, price}),
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log(await response.json())
        if (response.ok) {
            quantityElement.innerText = String(currentQuantity);
        } else {
            console.error('Failed to update cart item quantity');
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
    }
}

function roundTo(n, decimalPlaces) {
    return +(+(Math.round((n + 'e+' + decimalPlaces)) + 'e-' + decimalPlaces)).toFixed(decimalPlaces);
}