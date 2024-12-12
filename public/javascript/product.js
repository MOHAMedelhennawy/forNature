import { fetchProductById, fetchCartItems } from '/javascript/api/category.js'
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

    prodContainer.innerHTML = `
    <div class="prod-grid">
        <div class="prod-content">
            <div class="prod-info">
                <div class="img"><img src="/images/${product.image}" alt=""></div>
                <div class="info">
                    <div class="prod-category"><a class="category">Living room,</a>&nbsp;<a class="subCategory">Sofas</a></div>
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

async function productEventListener(user) {
    
    console.log(user)
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
}


async function handleAction(user, action) {
    if (user) {
        await action();
    } else {
        console.error('Please login and try again');
        window.location.assign('/login');
    }
}
