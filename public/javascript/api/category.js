export async function fetchCategories() {
    try {
        const response = await fetch(`/api/v1/category`);

        if (!response.ok) {
            console.error('Failed to fetch category');
        }

        return await response.json();
    } catch (error) {
        console.error(error);
    }
}


export async function fetchCartItems() {
    const response = await fetch('/api/cart');

    return response.ok ? await response.json() : [];
}

export async function fetchWishlistItems() {
    const response = await fetch('/api/v1/wishlist');

    return response.ok ? await response.json() : [];
}

export async function fetchProductById(id) {
    const response = await fetch(`/api/products/${id}`);

    if (!response.ok) console.error(`Failed to get product with ${id}`);

    return response.json();
}

export async function fetchDeleteWishlistItem(id) {
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