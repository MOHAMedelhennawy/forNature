document.addEventListener('DOMContentLoaded', async function () {
    await startProducts();
});

async function startProducts(page, limit) {

    const { currentPage, currentLimit } = getPaginationParams(page, limit) ;

    
    updateURLParams(currentPage, currentLimit);

    const data = await fetchProducts(currentPage, currentLimit);

    if (data && Array.isArray(data.products)) {
        renderProducts(data);
        addEventListeners(data.user);
    }
}

function updateURLParams(page, limit) {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    params.set('limit', limit);
    history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
}

function getPaginationParams(page, limit) {
    const params = new URLSearchParams(window.location.search);

    const currentPage = page || params.get('page') || 1;
    const currentLimit = limit || params.get('limit') || 28;

    return { currentPage, currentLimit };
}

async function fetchProducts(page, limit) {
    try {
        const response = await fetch(`/api/products?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to get products');
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error); 
    }
}

function renderPaginationButtons(currentPage, pages) {
    const pagination = document.querySelector('.pagination-wrapper');
    pagination.innerHTML = '';

    const createButton = (text, className = '') => {
        const button = document.createElement('button');
        button.textContent = text;
        if (className) button.classList.add(className);
        return button;
    };

    if (currentPage > 1) {
        pagination.appendChild(createButton('Previous', 'previousBtn'));
    }

    if (currentPage >= 1 && currentPage < 5) {
        for (let page = 1; page <= 4; page++) {
            pagination.appendChild(createButton(page));
        }
        pagination.appendChild(createButton('...', 'nextDots'));
        pagination.appendChild(createButton(pages));
    } 
    
    else if (currentPage >= 5 && currentPage <= pages - 2) {
        pagination.appendChild(createButton(1));
        pagination.appendChild(createButton('...', 'previousDots'));
        for (let page = currentPage; page < currentPage + 4; page++) {
            pagination.appendChild(createButton(page));
        }
        pagination.appendChild(createButton('...', 'nextDots'));
        pagination.appendChild(createButton(pages));
    } 
    
    else {
        pagination.appendChild(createButton(1));
        pagination.appendChild(createButton('...', 'previousDots'));
        for (let page = currentPage; page <= pages; page++) {
            pagination.appendChild(createButton(page));
        }
    }

    if (currentPage < pages) {
        pagination.appendChild(createButton('Next', 'nextBtn'));
    }
}

/**
 * Fetch user cart items and wishlist items.
 * 
 * @returns - Return array of arrays, for cart items, wishlist items.
 *            return null if there no itmes
 */
async function fetchCartAndWishlist() {
    const cartItemsResponse = await fetch('api/cart');
    const {allCartItems} = await cartItemsResponse.json();
    const cartItemMap = Array.isArray(allCartItems) ? new Map(allCartItems.map(item => [item.product_id, item])) : null;

    const wishlistResponse = await fetch('api/v1/wishlist');
    const wishlistResult = await wishlistResponse.json();
    const wishlistMap =  Array.isArray(wishlistResult) ? new Map(wishlistResult.map(item => [item.product_id, item])) : null;

    return [cartItemMap, wishlistMap];
}

/**
 * Display products
 *
 * @param {Object} data - Object of user data and products 
 */
const renderProducts = async (data) => {
    const productItem = document.querySelector('.product-item');
    const productGrid = document.querySelector('.product-grid');
    productItem.style.display = 'none';
    productGrid.innerHTML = '';

    // Create 10 item of skeleton element
    for (let i = 0; i < 8; i++) {
        const skeletonItem = createSkeletonProductItem();
        productGrid.appendChild(skeletonItem);
    }

    // Simulate longer loading time
    await new Promise(resolve => setTimeout(resolve, 3000));
    let cartItemMap, wishlistMap;
    if (data.user) {
        [cartItemMap, wishlistMap] = await fetchCartAndWishlist();
    }

    // Clean product-grid to delete skeleton items
    productGrid.innerHTML = '';

    // Display products
    for (const product of data.products) {
        const newItem = productItem.cloneNode(true);
        newItem.style.display = 'flex';

        newItem.querySelector('.product-image').src = `images/${product.image}`;
        newItem.querySelector('.product-name h3').textContent = product.name;
        newItem.querySelector('.product-summery').textContent = product.summary;
        newItem.querySelector('.price').textContent = roundTo(product.price, 3);
        newItem.dataset.id = product.id;

        if (data.user) {
            toggleCartButton(newItem, cartItemMap, product.id);
            toggleWishlistButton(newItem, wishlistMap, product.id);
        }

        productGrid.appendChild(newItem);
        newItem.classList.remove('skeleton');
        newItem.querySelectorAll('.skeleton').forEach(el => {
            el.classList.remove('skeleton')
            el.classList.remove('skeleton-text')
        });
    }

    renderPaginationButtons(data.page, data.pages);

};

/**
 * 
 * @param {*} newItem 
 * @param {*} cartItemMap 
 * @param {*} productId 
 */
function toggleCartButton(newItem, cartItemMap, productId) {

    if (!cartItemMap) return;

    const cartItem = cartItemMap.get(productId);

    if (cartItem) {
        const quantityButton = newItem.querySelector('.quantity-btn');
        const cartBtn = newItem.querySelector('.cart-btn');
        const currentQuantity = quantityButton.querySelector('.quantity');
        newItem.dataset.cartItemId = cartItem.id

        cartBtn.style.display = 'none';
        quantityButton.style.display = 'flex';
        currentQuantity.innerText = cartItem.quantity;
    }
}

function toggleWishlistButton(newItem, wihslistMap, productId) {

    if (!wihslistMap) return;
    const wishlistItem = wihslistMap.get(productId);
    
    if (wishlistItem) {
        const favourateBtn = newItem.querySelector('.favorate-btn i');
        favourateBtn.style.color = 'red';
        newItem.dataset.wishlistItemId = wishlistItem.id;
    }
}

async function addEventListeners(user) {
    
    // Use productGrid for event delegation to handle future dynamically added products
    const productGrid = document.querySelector('.product-grid');
    const pagination = document.querySelector('.pagination-wrapper');

    productGrid.addEventListener('click', async (event) => {
        // event.target: The specific element clicked on by the user
        const cartBtn = event.target.closest('.cart-btn');  // Check if the clicked element or its parent is the cart button
        const quantityButton = event.target.closest('.decrease-quantity, .increase-quantity');  // Check if the clicked element is a quantity button (increase or decrease)
        const favourateBtn = event.target.closest('.favorate-btn');
        // const 
        // Handle adding product to cart, if user click on cartBtn
        if (cartBtn) {
            await handleAction(user, () => handleCartButtonClick(cartBtn));
        } else if (quantityButton) {
            await handleAction(user, () => handleQuantityButtonsClick(quantityButton));
        } else if (favourateBtn) {
            await handleAction(user, () => handleFavourateButtonClick(user.id, favourateBtn));
        }
    })

    pagination.addEventListener('click', async (event) => {
        const previousBtn = event.target.closest('.previousBtn');
        const nextBtn = event.target.closest('.nextBtn');
        let currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
    
        if (previousBtn) {
            currentPage = Math.max(1, currentPage - 1);
        } else if (nextBtn) {
            currentPage += 1;
        } else {
            currentPage = parseInt(event.target.textContent) || 1;
        }
    
        await startProducts(currentPage);
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });
}

async function handleAction(user, action) {
    if (user) {
        await action();
    } else {
        console.error('Please login and try again');
        window.location.assign('/login');
    }
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
async function handleFavourateButtonClick(userId, favourateBtn) {
    const productItem = favourateBtn.closest('.product-item');
    const productId = productItem.dataset.id;

    const responseGetAllWishlist = await fetch(`/api/v1/wishlist?userId=${userId}&productId=${productId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })

    const getWishlistResult = await responseGetAllWishlist.json();   // get wishlist item

    if(!getWishlistResult) { // if item not fount, add new item to wishlist
        favourateBtn.querySelector('i').style.color = 'red';

        const responsePostWishlist = await fetch('/api/v1/wishlist', {
            method: 'POST',
            body: JSON.stringify({
                product_id: productId,
                user_id: userId,
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!responsePostWishlist.ok) {
            console.error('Failed to add item to wishlist');
        } else {
            const item = await responsePostWishlist.json();
            const wishlistContent = document.querySelector('.wishlist-content');
            const wishlistItemElement = document.querySelector('.wishlist-item');
            productItem.dataset.wishlistItemId = item.id;

            await addWishlistItemToWihslistUi(item, wishlistContent, wishlistItemElement);
        }
    } else {    // if wishlist is found, delete it from wishlist
        const { deletedItem } = await fetchDeleteWishlistItem(getWishlistResult.id);
        if (deletedItem) {
            const wishlistContainer = document.querySelector('.wishlist-container');
            const item = wishlistContainer.querySelector(`.wishlist-item[data-wishlist-item-id="${deletedItem.id}"]`);
            item.style.display = 'none'
            favourateBtn.querySelector('i').style.color = 'black';
        }
    }

}
async function fetchDeleteWishlistItem(id) {
    try {
        const response = await fetch(`api/v1/wishlist/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to delete item from wishlist');
        }

        return response.json() || null;
    } catch (error) {
        console.error('Error in fetchDeleteWishlistItem:', error);
        throw error;
    }
}
/**
 * This function to handle a click on quntity button
 * 
 * @param {HTMLElement} quantityButton
 */
async function handleQuantityButtonsClick(quantityButton) {
    const targetedItem = quantityButton.closest('.product-item, .cart-item');
    const cartBtn = targetedItem.querySelector('.cart-btn');
    const quantityElement = targetedItem.querySelector('.quantity');
    const currentQuantity = parseInt(quantityElement.innerText);  // Current quantity shown
    const increment = quantityButton.classList.contains('increase-quantity') ? 1 : -1;
    const productPrice = targetedItem.querySelector('.price').innerText;
    const newQuantity = currentQuantity + increment;  // Calculate new quantity
    const cartItemId = targetedItem.dataset.cartItemId;

    // Only update if the new quantity is 1 or more
    if (newQuantity > 0) {
        console.log(`new quantity is equal to: ${newQuantity}`);
        await updateQuantity(cartItemId, quantityElement, increment, productPrice);
    } else {
        console.log(`new quantity is equal to: ${newQuantity}`);
        await removeFromCart(cartItemId, cartBtn, quantityElement, productPrice);
    }
}

async function removeFromCart(cartItemId, productPrice) {
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
async function handleCartButtonClick(cartBtn) {
    const productItem = cartBtn.closest('.product-item');  // Get the closest parent with class "product-item"
    const productPrice = productItem.querySelector('.price').innerText;
    const productId = productItem.dataset.id;  // Retrieve product ID from data attribute

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
        
        if (response.ok) {
            updateQuantityInUI(cartItemId, currentQuantity);
        } else {
            console.error('Failed to update cart item quantity');
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
    }
}

function updateQuantityInUI(cartItemId, newQuantity) {
    const itemsToUpdate = document.querySelectorAll(`[data-cart-item-id="${cartItemId}"]`);   // get elements with cartItemId from products and cart
    itemsToUpdate.forEach((element) => {    // loop to update the value
        element.querySelector('.quantity').innerText = newQuantity;
    });

    if (newQuantity === 0) {
        itemsToUpdate.forEach((element) => {
            if (element.classList.contains('cart-item')) {
                element.remove();
            } else if (element.classList.contains('product-item')) {
                element.querySelector('.quantity-btn').style.display = 'none';
                element.querySelector('.cart-btn').style.display = 'block';
            }
        })
    }
}

function roundTo(n, decimalPlaces) {
    return +(+(Math.round((n + 'e+' + decimalPlaces)) + 'e-' + decimalPlaces)).toFixed(decimalPlaces);
}

function createSkeletonProductItem() {
    const skeletonItem = document.createElement('div');
    skeletonItem.style.display = 'flex';
    skeletonItem.classList.add('product-item', 'skeleton');

    const productImage = document.createElement('img');
    productImage.classList.add('product-image', 'skeleton');
    productImage.src = '';
    productImage.alt = '';
    skeletonItem.appendChild(productImage);

    const productInfo = document.createElement('div');
    productInfo.classList.add('product-information');

    const productName = document.createElement('div');
    productName.classList.add('product-name', 'skeleton');
    const productNameText = document.createElement('h3');
    productNameText.classList.add('skeleton-text');
    productName.appendChild(productNameText);
    productInfo.appendChild(productName);

    const productRating = document.createElement('div');
    productRating.classList.add('product-rating', 'skeleton');
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        star.classList.add('fa', 'fa-star', 'checked', 'skeleton');
        if (i === 4) {
            star.classList.remove('fa-star');
            star.classList.add('fa-star-half');
        }
        productRating.appendChild(star);
    }
    productInfo.appendChild(productRating);

    const productSummary = document.createElement('p');
    productSummary.classList.add('product-summery', 'skeleton-text');
    productInfo.appendChild(productSummary);

    const buttons = document.createElement('div');
    buttons.classList.add('buttons');

    const price = document.createElement('div');
    price.classList.add('price', 'skeleton-text');
    buttons.appendChild(price);

    const cartBtn = document.createElement('button');
    cartBtn.classList.add('cart-btn', 'skeleton');
    cartBtn.textContent = 'Add to cart';
    buttons.appendChild(cartBtn);

    const quantityBtn = document.createElement('div');
    quantityBtn.classList.add('quantity-btn');
    const decreaseBtn = document.createElement('button');
    decreaseBtn.classList.add('decrease-quantity');
    decreaseBtn.innerHTML = "<i class='bx bx-minus'></i>";
    const quantity = document.createElement('span');
    quantity.classList.add('quantity', 'skeleton-text');
    quantity.textContent = '1';
    const increaseBtn = document.createElement('button');
    increaseBtn.classList.add('increase-quantity');
    increaseBtn.innerHTML = "<i class='bx bx-plus'></i>";
    quantityBtn.appendChild(decreaseBtn);
    quantityBtn.appendChild(quantity);
    quantityBtn.appendChild(increaseBtn);
    buttons.appendChild(quantityBtn);

    const favoriteBtn = document.createElement('button');
    favoriteBtn.classList.add('favorate-btn', 'skeleton');
    favoriteBtn.innerHTML = "<i class='material-icons'>favorite</i>";
    buttons.appendChild(favoriteBtn);

    productInfo.appendChild(buttons);
    skeletonItem.appendChild(productInfo);

    return skeletonItem;
}