import { 
    getPaginationParams,
    renderPaginationButtons,
} from '/javascript/components/pagination.js';
import { getSelectedFilters, renderFilter, updateURLFilters, getFilterParams } from '/javascript/components/filter.js'
import { 
    toggleCartButton,
    handleQuantityButtonsClick,
    handleCartButtonClick,
} from '/javascript/components/cart.js'
import {
    toggleWishlistButton,
    fetchCartAndWishlist,
    handleFavourateButtonClick,

} from '/javascript/components/wishlist.js'

let currentUser = null;

document.addEventListener('DOMContentLoaded', async function () {
    await startProducts();
    await renderFilter();
    addEventListeners();
});

async function startProducts(page, limit, filters = {}) {
    const { currentPage, currentLimit } = getPaginationParams(page, limit);
    filters = getFilterParams(filters);
    updateURLParams(currentPage, currentLimit);

    const data = await fetchProducts(currentPage, currentLimit, filters);

    if (data && Array.isArray(data.products)) {
        currentUser = data.user;
        await renderProducts(data);
    }
}

function updateURLParams(page, limit) {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    params.set('limit', limit);
    history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
}

async function fetchProducts(page, limit, filters = {}) {
    try {
        // Construct the URL with pagination and filter parameters
        const url = new URL('/api/products', window.location.origin);
        url.searchParams.set('page', page);
        url.searchParams.set('limit', limit);

        // Add categories filter if present
        if (filters.categories && filters.categories.length > 0) {
            url.searchParams.set('categories', filters.categories.join(','));
        }

        // Add subCategories filter if present
        if (filters.subCategories && filters.subCategories.length > 0) {
            url.searchParams.set('subCategories', filters.subCategories.join(','));
        }

        if (filters.minPrice) {
            url.searchParams.set('minPrice', filters.minPrice);
        }

        if (filters.maxPrice) {
            url.searchParams.set('maxPrice', filters.maxPrice);
        }

        const response = await fetch(url.toString());

        if (!response.ok) throw new Error('Failed to get products');

        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}


/**
 * Display products
 *
 * @param {Object} data - Object of user data and products 
 */
const renderProducts = async (data) => {
    let cartItemMap, wishlistMap;
    const productItemTemplate = document.querySelector('.product-item');
    const productGrid = document.querySelector('.product-grid');
    productItemTemplate.style.display = 'none';
    productGrid.innerHTML = '';

    // Create 10 item of skeleton element
    for (let i = 0; i < 8; i++) {
        const skeletonItem = createSkeletonProductItem();
        productGrid.appendChild(skeletonItem);
    }

    // Simulate longer loading time
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (data.user) {
        [cartItemMap, wishlistMap] = await fetchCartAndWishlist();
    }

    // Clean product-grid to delete skeleton items
    productGrid.innerHTML = '';

    // Display products
    data.products.forEach(product => {
        const newItem = createProductElement(product, cartItemMap, wishlistMap, data.user);
        productGrid.appendChild(newItem);
    });

    renderPaginationButtons(data.page, data.pages);
};

const createProductElement = (product, cartItemMap, wishlistMap, user) => {
    const newItem = createProductTemplate(product);
    newItem.style.display = 'flex';
    newItem.dataset.id = product.id;

    // Add click listeners for redirection
    setupEventListeners(newItem, product.id);

    if (user) {
        toggleCartButton(newItem, cartItemMap, product.id);
        toggleWishlistButton(newItem, wishlistMap, product.id);
    }

    newItem.classList.remove('skeleton');
    newItem.querySelectorAll('.skeleton').forEach(el => el.classList.remove('skeleton', 'skeleton-text'));

    return newItem;
};


function createProductTemplate(product) {
    const newTemplate = document.createElement('div');
    newTemplate.className = 'product-item';

    newTemplate.innerHTML = `
            <img class="product-image" src="images/products/${product.image}" alt="">

            <div class="product-information">
                <div class="product-name">
                    <h3>${product.name}</h3>
                </div>
                <div class="product-rating">
                    <span class="fa fa-star checked"></span>
                    <span class="fa fa-star checked"></span>
                    <span class="fa fa-star checked"></span>
                    <span class="fa fa-star checked"></span>
                    <span class="fa fa-star-half"></span>
                </div>
                <p class="product-summery">${product.summary}</p>
                <div class="buttons">
                    <div class="price">${roundTo(product.price, 3)}</div>
                    <button class="cart-btn">Add to cart</button>
                    <div class="quantity-btn">
                        <button class="decrease-quantity"><i class='bx bx-minus'></i></button>
                        <span class="quantity ">1</span>
                        <button class="increase-quantity"><i class='bx bx-plus'></i></button>
                    </div>
                    <button class="favorate-btn"><i class="material-icons">favorite</i></button>
                </div>
            </div>
        `
    return newTemplate;
}

// Function to setup click event listeners
const setupEventListeners = (element, productId) => {
    const redirectToProductPage = () => window.location.href = `/product/${productId}`;

    element.querySelectorAll('.product-image, .product-name h3, .product-summery, .price')
        .forEach(el => el.addEventListener('click', redirectToProductPage));
};


async function addEventListeners() {
    
    // Use productGrid for event delegation to handle future dynamically added products
    const productGrid = document.querySelector('.product-grid');
    const pagination = document.querySelector('.pagination-wrapper');
    const filetrationForm = document.querySelector('.filteration-form');

    productGrid.addEventListener('click', async (event) => {
        // event.target: The specific element clicked on by the user
        const cartBtn = event.target.closest('.cart-btn');  // Check if the clicked element or its parent is the cart button
        const quantityButton = event.target.closest('.decrease-quantity, .increase-quantity');  // Check if the clicked element is a quantity button (increase or decrease)
        const favourateBtn = event.target.closest('.favorate-btn');
        const productItem = event.target.closest('.product-item');

        // Handle adding product to cart, if user click on cartBtn
        if (cartBtn) {
            await handleAction(currentUser, async () => await handleCartButtonClick(cartBtn));
        } else if (quantityButton) {
            await handleAction(currentUser, async () => await handleQuantityButtonsClick(quantityButton));
        } else if (favourateBtn) {
            await handleAction(currentUser, async () => await handleFavourateButtonClick(currentUser.id, favourateBtn));
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

    filetrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const { categories, subCategories } = getSelectedFilters(filetrationForm);
        const minPrice = document.getElementById('fromInput').value;
        const maxPrice = document.getElementById('toInput').value;

        updateURLFilters(categories, subCategories, minPrice, maxPrice);
        await startProducts(1, 28, { categories, subCategories, minPrice, maxPrice });
    })
}

async function handleAction(currentUser, action) {
    if (currentUser) {
        await action();
    } else {
        console.error('Please login and try again');
        window.location.assign('/login');
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