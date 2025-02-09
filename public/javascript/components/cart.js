import { fetchProductById } from '/javascript/api/apis.js'

/**
 * 
 * @param {*} newItem 
 * @param {*} cartItemMap 
 * @param {*} productId 
 */
export function toggleCartButton(newItem, cartItemMap, productId) {

    if (!cartItemMap) return;


    const cartItem = cartItemMap.get(productId) || null;

    if (cartItem) {
        const quantityButton = newItem.querySelector('.quantity-btn');
        const cartBtn = newItem.querySelector('.cart-btn');
        const currentQuantity = quantityButton.querySelector('.quantity');
        newItem.dataset.cartItemId = cartItem.id

        cartBtn.style.display = 'none';
        quantityButton.style.display = 'flex';
        currentQuantity.innerText = cartItem.quantity;
    } else {
        console.log(` Cart Doesn't exist`)
    }
}

/**
 * This function to handle a click on quntity button
 * 
 * @param {HTMLElement} quantityButton
 */
export async function handleQuantityButtonsClick(quantityButton) {
    const targetedItem = quantityButton.closest('.product-item, .cart-item, .prod-container');
    const cartBtn = targetedItem.querySelector('.cart-btn');
    const quantityElement = targetedItem.querySelector('.quantity');
    const currentQuantity = parseInt(quantityElement.innerText);  // Current quantity shown
    const increment = quantityButton.classList.contains('increase-quantity') ? 1 : -1;
    const productPrice = targetedItem.querySelector('.price') || targetedItem.querySelector('.prod-price .p');
    const price = productPrice.innerText;
    const newQuantity = currentQuantity + increment;  // Calculate new quantity
    const cartItemId = targetedItem.dataset.cartItemId;

    // Only update if the new quantity is 1 or more
    if (newQuantity > 0) {
        await updateQuantity(cartItemId, quantityElement, increment, price);
    } else {
        await removeFromCart(cartItemId, price);
    }
}

export async function removeFromCart(cartItemId, productPrice) {
    const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
        body: JSON.stringify({ price: productPrice }),
        headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
        updateQuantityInUI(cartItemId, 0);
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
export async function handleCartButtonClick(cartBtn) {
    const productItem = cartBtn.closest('.product-item, .prod-container');  // Get the closest parent with class "product-item"
    const productPrice = productItem.querySelector('.price') || productItem.querySelector('.prod-price .p');
    const price = productPrice.innerText;
    const productId = productItem.dataset.id;  // Retrieve product ID from data attribute

    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, price }),
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (response.ok) {
            cartBtn.style.display = 'none';    
            const quantityButton = productItem.querySelector('.quantity-btn');
            quantityButton.style.display = 'flex';
            productItem.dataset.cartItemId = result.id

            renderUserCart([result]);
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
export async function updateQuantity(cartItemId, quantityElement, increment, productPrice) {
    const price = parseFloat(productPrice) * increment
    let currentQuantity = Number(quantityElement.innerText);
    currentQuantity = Math.max(0, currentQuantity + increment);
    
    try {
        const response = await fetch(`/api/cart/${cartItemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: currentQuantity, price}),
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            updateQuantityInUI(cartItemId, currentQuantity, increment);
        } else {
            console.error('Failed to update cart item quantity');
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
    }
}

export function updateQuantityInUI(cartItemId, newQuantity, increment) {
    const itemsToUpdate = document.querySelectorAll(`[data-cart-item-id="${cartItemId}"]`);   // get elements with cartItemId from products and cart
    itemsToUpdate.forEach((element) => {    // loop to update the value
        element.querySelector('.quantity').innerText = newQuantity;

        if (element.classList.contains('cart-item')) {
            const productPrice  = element.querySelector('.price');
            const totalProductPrice = element.querySelector('.test');
            const updatedPrice = parseFloat(totalProductPrice.innerText) + (parseFloat(productPrice.innerText) * increment);

            totalProductPrice.innerText = updatedPrice.toFixed(2);
        }
    });

    if (newQuantity === 0) {
        itemsToUpdate.forEach((element) => {
            if (element.classList.contains('cart-item')) {
                element.style.display = 'none';
            } else if (element.classList.contains('product-item') || element.classList.contains('prod-container')) {
                element.querySelector('.quantity-btn').style.display = 'none';
                element.querySelector('.cart-btn').style.display = 'block';
            }
        })
    }
}


export async function renderUserCart(userCartItems) {
    const cartContent = document.querySelector('.cart-content');
    const cartItemElement = cartContent.querySelector('.cart-item');

    if (Array.isArray(userCartItems)) {
        for (const item of userCartItems) {
            await addCartItemsToCartInUi(item, cartContent, cartItemElement);
        }
    }
}

export async function addCartItemsToCartInUi(item, cartContent, cartItemElement) {
    const newCartItem = cartItemElement.cloneNode(true);
    const cartImg = newCartItem.querySelector('.cart-img img');
    const cartName = newCartItem.querySelector('.cart-name');
    const cartSummery = newCartItem.querySelector('.cart-summery');
    const cartQuantity = newCartItem.querySelector('.quantity-btn.cart .quantity');
    const cartPrice = newCartItem.querySelector('.price');
    const test = newCartItem.querySelector('.test');
    const { product } = await fetchProductById(item.product_id);
    const totalProductPrice = product.price * item.quantity;
    newCartItem.dataset.cartItemId = item.id;

    cartImg.src = `/images/products/${product.image}`;
    cartName.innerText = product.name;
    cartSummery.innerText = product.summary;
    cartQuantity.innerText = item.quantity;
    cartPrice.innerText = product.price;
    newCartItem.style.display = 'flex';
    test.innerText = totalProductPrice.toFixed(2);
    cartContent.appendChild(newCartItem);
}
