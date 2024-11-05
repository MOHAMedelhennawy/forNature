document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to get products');

        const data = await response.json();
        if (data && Array.isArray(data.products)) {
            display(data);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
});

const display = (data) => {
    const productItem = document.querySelector('.product-item');
    const productGrid = document.querySelector('.product-grid');
    productItem.style.display = 'none';

    for (const product of data.products) {
        const newItem = productItem.cloneNode(true);
        newItem.style.display = 'block';

        newItem.querySelector('.product-image').src = `images/${product.image}`;
        newItem.querySelector('.product-name h3').textContent = product.name;
        newItem.querySelector('.product-summery').textContent = product.summary;
        newItem.querySelector('.price').textContent = roundTo(product.price, 3);
        newItem.id = product.id;

        const cartBtn = newItem.querySelector('.cart-btn');
        cartBtn.addEventListener('click', async () => {
            const user = data.user;
            if (user) {
                try {
                    const productQuantity = newItem.querySelector('.product-quantity');
                    const response = await fetch('/api/cart', {
                        method: 'POST',
                        body: JSON.stringify(product),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    cartBtn.style.display = 'none';
                    productQuantity.style.display = 'flex';

                    if (response.ok) {
                        const result = await response.json();
                        console.log(result);
                    } else {
                        console.error('Failed to add product to cart');
                    }

                    const decreaseQuantity = productQuantity.querySelector('.decrease-quantity');
                    const increaseQuantity = productQuantity.querySelector('.increase-quantity');
                    const quantity = productQuantity.querySelector('.quantity');

                    decreaseQuantity.addEventListener('click', () => updateQuantity(product, quantity, -1));
                    increaseQuantity.addEventListener('click', () => updateQuantity(product, quantity, 1));

                } catch (error) {
                    console.error('Error adding product to cart:', error);
                }
            }
        });
        productGrid.appendChild(newItem);
    }
};

async function updateQuantity(product, quantityElement, increment) {
    let currentQuantity = Number(quantityElement.innerText);
    currentQuantity = Math.max(0, currentQuantity + increment);
    const response = await fetch('/api/cart', {
        method: 'PUT',
        body: JSON.stringify({
            ...product,
            quantity: currentQuantity
        }),
        headers: { 'Content-Type': 'application/json' }
    })
    quantityElement.innerText = String(currentQuantity);
}


function roundTo(n, decimalPlaces) {
    return +(+(Math.round((n + 'e+' + decimalPlaces)) + 'e-' + decimalPlaces)).toFixed(decimalPlaces);
}