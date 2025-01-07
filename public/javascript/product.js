import { fetchProductById, fetchPostReview } from '/javascript/api/apis.js'
import { handleCartButtonClick, handleQuantityButtonsClick, toggleCartButton } from '/javascript/components/cart.js'
import { fetchCartAndWishlist, toggleWishlistButton, handleFavourateButtonClick } from '/javascript/components/wishlist.js'

document.addEventListener('DOMContentLoaded', async () => {

    const { user } = await renderProduct();
    await productEventListener(user);
})

async function renderProduct() {
    // Get product id from url
    const id = getUrlParams();

    // fetch product using id
    const data = await fetchProductById(id);

    // display product
    displayProduct(data);

    return data;
}

function getUrlParams() {
    return window.location.href.split('/')[4];
}

async function displayProduct(data) {
    const { product, user } = data;
    const prodContainer = document.querySelector('.prod-container');
    const ratingSystemHTML = ratingSystem();
    const reviewHTML = getReviewViews(product);

    prodContainer.innerHTML = `
    <div class="prod-grid">
        <div class="prod-content">
            <div class="prod-info">
                <div class="img"><img src="/images/products/${product.image}" alt=""></div>
                <div class="info">
                    <div class="prod-category"><a class="category">${product.category.name},</a>&nbsp;<a class="subCategory">${product.subCategory.name}</a></div>
                    <h1 class="prod-name">${product.name}</h1>
                    <div class="prod-price">$<span class="p">${product.price}</span> &nbsp;<span class="shipping">+Free Shipping</span></div>
                    <p class="prod-summary">${product.summary}</p>
                    <div class="buttons">
                        <button class="cart-btn ">Add to cart</button>
                        <div class="quantity-btn">
                            <button class="decrease-quantity"><i class='bx bx-minus'></i></button>
                            <span class="quantity">1</span>
                            <button class="increase-quantity"><i class='bx bx-plus'></i></button>
                        </div>
                        <button class="favorate-btn"><i class="material-icons">favorite</i></button>
                    </div>
                </div>
            </div>
        </div>
        <div class="hr"></div>
        <div class="prod-description">
            <h1>Description</h1>
            <p>${product.description}</p>
        </div>
        <div class="hr"></div>
        <div class="prod-reviews">
            <h1>Reviews</h1>
            <form class="review-form">
                <textarea id="reivew" name="review"></textarea>
                <div class="rate">
                    ${ratingSystemHTML}
                    <button class="review-btn">Click me!</button>
                </div>
            </form>
            <div class="reviews">
                ${reviewHTML}
            </div>
        </div>
    </div>
    `;
    prodContainer.dataset.id = product.id;

    
    if (user) {
        const [cartItemMap, wishlistMap] = await fetchCartAndWishlist();
        toggleCartButton(prodContainer, cartItemMap, product.id);
        toggleWishlistButton(prodContainer, wishlistMap, product.id)
    }
}

function ratingSystem() {
    return `
    <div class="container__items">
        <input type="radio" name="stars" id="st5">
        <label for="st5">
            <div class="star-stroke">
                <div class="star-fill"></div>
            </div>
            <div class="label-description" data-content="5"></div>
        </label>

        <input type="radio" name="stars" id="st4">
        <label for="st4">
            <div class="star-stroke">
                <div class="star-fill"></div>
            </div>
            <div class="label-description" data-content="4"></div>
        </label>

        <input type="radio" name="stars" id="st3">
        <label for="st3">
            <div class="star-stroke">
                <div class="star-fill"></div>
            </div>
            <div class="label-description" data-content="3"></div>
        </label>

        <input type="radio" name="stars" id="st2">
        <label for="st2">
            <div class="star-stroke">
                <div class="star-fill"></div>
            </div>
            <div class="label-description" data-content="2"></div>
        </label>

        <input type="radio" name="stars" id="st1">
        <label for="st1">
            <div class="star-stroke">
                <div class="star-fill"></div>
            </div>
            <div class="label-description" data-content="1"></div>
        </label>
  </div>
  `
}

async function productEventListener(user) {

    const reviewForm = document.querySelector('.review-form');

    document.addEventListener('click', async (event) => {
        const cartBtn = event.target.closest('.cart-btn');  // Check if the clicked element or its parent is the cart button
        const quantityButton = event.target.closest('.decrease-quantity, .increase-quantity');  // Check if the clicked element is a quantity button (increase or decrease)
        const favourateBtn = event.target.closest('.favorate-btn');

        if (cartBtn) {
            await handleAction(user, () => handleCartButtonClick(cartBtn));
        } else if (quantityButton) {
            await handleAction(user, () => handleQuantityButtonsClick(quantityButton));
        } else if (favourateBtn) {
            await handleAction(user, () => handleFavourateButtonClick(user.id, favourateBtn));
        }
    })

    document.addEventListener('submit', async (event) => {
        const reviewForm = event.target.closest('.review-form');
        
        if (!reviewForm) return;
        
        event.preventDefault();

        const rating = document.querySelector('.container__items input[name="stars"]:checked').nextElementSibling.querySelector('.label-description').dataset.content;
        const review = reviewForm.review.value;
        const product_id = document.querySelector('.prod-container').dataset.id;

        if (!rating) {
            console.error('Please select a rating.');
            return;
        }

        if (!review.trim()) {
            console.error("Please write a review.");
            return;
        }

        const reviewResponse = await fetchPostReview(product_id, review, rating);

        if (!reviewResponse) {
            console.error('Failed to add your review, please try again.');
        } else {
            const startContainer = document.querySelector('.container__items');
            const startHTML = startContainer.innerHTML;
            const reviewsElement = document.querySelector('.reviews');
            const reviewInput = document.querySelector('.review-form textarea');
            const review = reviewResponse.newReview;

            review.user = reviewResponse.user;

            const newReviewHTML = displayReview(review);
            reviewsElement.innerHTML = newReviewHTML + reviewsElement.innerHTML;

            reviewInput.value = '';
            startContainer.innerHTML = startHTML;
        }
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

function getReviewViews(product) {
    let reviewsHTML = '';

    product.reviews.forEach(review => {
        reviewsHTML += displayReview(review);
    });

    return reviewsHTML;
}

function ratingStars(rate) {
    let stars = '';

    for (let i = 0; i < 5; i++) {
        if (i < rate) {
            stars += `
                <span class="fa fa-star checked"></span>
            `
        } else {
            stars += `
            <span class="fa fa-star"></span>
        `
        }
    }

    return stars
}

function displayReview(review) {
    return `
            <div class="review">
                <div class="review-user">
                    <img src="/images/users/user.png" alt="${review.user.first_name}" class="user-image">
                    <span class="user-name">${review.user.first_name} ${review.user.last_name}</span>
                </div>
                <div class="review-content">
                    <p class="user-rate">${ratingStars(review.rating)}</p>
                    <p class="user-review">${review.review}</p>
                </div>
            </div>
        `
}