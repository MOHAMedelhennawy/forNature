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


document.addEventListener('DOMContentLoaded', async function () {
    await startProducts();
    await renderFilter();
});

async function startProducts(page, limit, filters = {}) {
    const { currentPage, currentLimit } = getPaginationParams(page, limit);
    filters = getFilterParams(filters);
    updateURLParams(currentPage, currentLimit);

    const data = await fetchProducts(currentPage, currentLimit, filters);

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
    
        const productImage = newItem.querySelector('.product-image');
        const productName = newItem.querySelector('.product-name h3');
        const productSummary = newItem.querySelector('.product-summery');
        const productPrice = newItem.querySelector('.price');
    
        productImage.src = `images/${product.image}`;
        productName.textContent = product.name;
        productSummary.textContent = product.summary;
        productPrice.textContent = roundTo(product.price, 3);
        newItem.dataset.id = product.id;
    
        // Add event listener for redirect to each element
        const redirectToProductPage = () => {
            window.location.href = `/product/${product.id}`;
        };
    
        productImage.addEventListener('click', redirectToProductPage);
        productName.addEventListener('click', redirectToProductPage);
        productSummary.addEventListener('click', redirectToProductPage);
        productPrice.addEventListener('click', redirectToProductPage);
    
        if (data.user) {
            toggleCartButton(newItem, cartItemMap, product.id);
            toggleWishlistButton(newItem, wishlistMap, product.id);
        }
    
        productGrid.appendChild(newItem);
        newItem.classList.remove('skeleton');
        newItem.querySelectorAll('.skeleton').forEach(el => {
            el.classList.remove('skeleton');
            el.classList.remove('skeleton-text');
        });
    
    }

    renderPaginationButtons(data.page, data.pages);
};


async function addEventListeners(user) {
    
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

    filetrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const { categories, subCategories } = getSelectedFilters(filetrationForm);
        const minPrice = document.getElementById('fromInput').value;
        const maxPrice = document.getElementById('toInput').value;

        updateURLFilters(categories, subCategories, minPrice, maxPrice);
        await startProducts(1, 28, { categories, subCategories, minPrice, maxPrice });
    })
}

async function handleAction(user, action) {
    if (user) {
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