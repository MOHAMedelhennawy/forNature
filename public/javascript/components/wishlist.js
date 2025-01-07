import {
    fetchProductById,
    fetchDeleteWishlistItem,
} from '/javascript/api/apis.js'

export function toggleWishlistButton(newItem, wihslistMap, productId) {

    if (!wihslistMap) return;
    const wishlistItem = wihslistMap.get(productId);
    
    if (wishlistItem) {
        const favourateBtn = newItem.querySelector('.favorate-btn i');
        favourateBtn.style.color = 'red';
        newItem.dataset.wishlistItemId = wishlistItem.id;
    }
}

/**
 * Fetch user cart items and wishlist items.
 * 
 * @returns - Return array of arrays, for cart items, wishlist items.
 *            return null if there no itmes
 */
export async function fetchCartAndWishlist() {
    const cartItemsResponse = await fetch('/api/cart');
    const {allCartItems} = await cartItemsResponse.json();
    const cartItemMap = Array.isArray(allCartItems) ? new Map(allCartItems.map(item => [item.product_id, item])) : null;

    const wishlistResponse = await fetch('/api/v1/wishlist');
    const wishlistResult = await wishlistResponse.json();
    const wishlistMap =  Array.isArray(wishlistResult) ? new Map(wishlistResult.map(item => [item.product_id, item])) : null;

    return [cartItemMap, wishlistMap];
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
export async function handleFavourateButtonClick(userId, favourateBtn) {
    const productItem = favourateBtn.closest('.product-item, .prod-container');
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


export async function renderWishlistItems(wishlistItems) {
    const wishlistContent = document.querySelector('.wishlist-content');
    const wishlistItemElement = document.querySelector('.wishlist-item');

    for (const item of wishlistItems) {
        if (Array.isArray(wishlistItems)) {
            await addWishlistItemToWihslistUi(item, wishlistContent, wishlistItemElement);
        }
    }
}



export async function addWishlistItemToWihslistUi(item, wishlistContent, wishlistItemElement) {
    const newWishlistItem = wishlistItemElement.cloneNode(true);
    const wishlistImg = newWishlistItem.querySelector('.wishlist-img img');
    const wishlistName = newWishlistItem.querySelector('.wishlist-name');
    const wishlistSummery = newWishlistItem.querySelector('.wishlist-summery');
    const wishlistPrice = newWishlistItem.querySelector('.price');
    const { product } = await fetchProductById(item.product_id);
    newWishlistItem.dataset.wishlistItemId = item.id;

    wishlistImg.src = `/images/products/${product.image}`;
    wishlistName.innerText = product.name;
    wishlistSummery.innerText = product.summary;
    wishlistPrice.innerText = product.price;
    newWishlistItem.style.display = 'flex';

    wishlistContent.appendChild(newWishlistItem);
}