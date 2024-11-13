document.addEventListener('DOMContentLoaded', async function () {
    const cartElement = document.querySelector('.cart-link');
    const cartContainer = document.querySelector('.cart-container');
    let isVisible = false;
    
    const userCartItems = await getCartItems();
    renderUserCart(userCartItems);

    cartElement.addEventListener('click', () => {
        if (isVisible) {
            cartContainer.style.width = '0';
        } else {
            cartContainer.style.width = '25rem';
        }

        isVisible = !isVisible;
    })


})

async function getCartItems() {
    const response = await fetch('/api/cart');

    if (!response.ok) console.error('Failed to get cart items');

    return response.json();
}

function renderUserCart(userCartItems) {

}