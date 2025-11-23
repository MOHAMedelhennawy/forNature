import { fetchCategories } from '/javascript/api/apis.js';

document.addEventListener('DOMContentLoaded', async _ => {
    const orders = await fetchOrders();

    await renderOrders(orders);
    adminEventListeners(orders);
})

async function renderOrders(orders) {
    const tbody = document.querySelector('.orders-table tbody');

    // Clear existing rows
    tbody.innerHTML = '';

    if (orders < 0 && !Array.isArray(orders)) {
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.id = order.id;

        row.innerHTML = `
            <td class="order-id">${order.id}</td>
            <td class="order-cost">$${order.total_cost}</td>
            <td class="order-status">
                <select class="order-status-dropdown">
                    <option value="Pending" class="status-pending" ${
                        order.status === 'PENDING' ? 'selected' : ''
                    }>Pending</option>
                    <option value="Completed" class="status-completed" ${
                        order.status === 'COMPLETED' ? 'selected' : ''
                    }>Completed</option>
                    <option value="Cancelled" class="status-cancelled" ${
                        order.status === 'CANCELLED' ? 'selected' : ''
                    }>Cancelled</option>
                </select>
            </td>
            <td class="order-buttons">
                <button class="btn-view-details">View Details</button>
                <button class="btn-delete">Delete</button>
            </td>
        `;

        tbody.appendChild(row);

        // Change color based on selected value
        const orderStatus = row.querySelector('.order-status-dropdown');
        const selectedElement = orderStatus.options[orderStatus.selectedIndex];

        // Apply background color based on the selected option
        const statusClasses = {
            'status-pending': '#f9c74f', // Yellow for Pending
            'status-completed': '#43aa8b', // Green for Completed
            'status-cancelled': '#f94144' // Red for Cancelled
        };

        const applyBackgroundColor = () => {
            const selectedClass = selectedElement.classList[0]; // Get the first class
            orderStatus.style.backgroundColor = statusClasses[selectedClass] || '';
            orderStatus.style.color = 'white'
        };

        // Apply color on load
        applyBackgroundColor();

        // Listen for changes and update background color dynamically
        orderStatus.addEventListener('change', () => {
            const newSelectedElement = orderStatus.options[orderStatus.selectedIndex];
            const newSelectedClass = newSelectedElement.classList[0];
            orderStatus.style.backgroundColor = statusClasses[newSelectedClass] || '';
        });

        // Attach event listeners for dynamic elements
        const statusSelect = row.querySelector('.order-status select');
        const viewButton = row.querySelector('.btn-view-details');
        const deleteButton = row.querySelector('.btn-delete');

        statusSelect.addEventListener('change', () => updateStatus(statusSelect, order.id));
        deleteButton.addEventListener('click', async (event) => {
            const deletedOrder = await deleteOrder(order.id);
            if (deletedOrder) {
                    const tr = event.target.closest('tr');
                    tr.style.display = 'none';
            }
        });
    });
}

// Update Status Function
async function updateStatus(selectElement, orderId) {
    try {
        const statusClasses = ['status-pending', 'status-completed', 'status-cancelled'];
        selectElement.classList.remove(...statusClasses);

        if (selectElement.value === 'Pending') {
            selectElement.classList.add('status-pending');
        } else if (selectElement.value === 'Completed') {
            selectElement.classList.add('status-completed');
        } else if (selectElement.value === 'Cancelled') {
            selectElement.classList.add('status-cancelled');
        }

        // Send status update to server
        const response = await fetch(`/api/v1/order/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: selectElement.value }),
        })
        
        if (!response.ok) {
            alert('Failed to update order status.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Delete Order Function
async function deleteOrder(orderId) {
    try {
        const confirmed = confirm('Are you sure you want to delete this order?');
        if (confirmed) {
            const response = await fetch(`/api/v1/order/${orderId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete the order');
            }

            alert('Order deleted successfully.');
            // Fetch updated orders (replace with actual fetching logic)
            return await response.json()
        }
    } catch (error) {
        console.error('Error:', error.message);
        alert('An error occurred while deleting the order. Please try again.');
    }
}

async function fetchOrders() {
    try {
        const response = await fetch('/api/v1/order');

        return response.ok ? await response.json() : [];
    } catch (error) {
        console.error(error.message);
    }
}

function adminEventListeners(orders) {
    const addProductBtn = document.querySelector('.add-product.btn');
    const closePopupButton = document.getElementById('closePopup');
    const popup = document.getElementById('popup');
    const popupOverlay = document.getElementById('popup-overlay');
    const orderButtons = document.querySelector('.order-buttons');


    document.addEventListener('click', (event) => {
        // Open order popup
        if (orders.length > 0 && Array.isArray(orders)) {
            if (event.target.classList.contains('btn-view-details')) {
                console.log(event.target)
                const order_id = event.target.closest('tr').id;
                openPopupWindow(popup, popupOverlay, order_id, viewDetails)
            }
        }
    })

    // Open product popup
    addProductBtn.addEventListener('click', () => openPopupWindow(popup, popupOverlay, null, renderProductForm));

    // Close popup
    closePopupButton.addEventListener('click', () => closePopupWindow(popup, popupOverlay));

    // Close popup by clicking outside
    popupOverlay.addEventListener('click', () => closePopupWindow(popup, popupOverlay));
}

// View Details Function
async function viewDetails(orderId, popup) {
    const popupBody = popup.querySelector('.popup-body');
    const order = await fetchOrder(orderId);
    const { user, orderItems } = order;

    let tableContent = `
        <h3>User Email: ${user.email}</h3>
        <h3>Phone Number: ${user.phone_number}</h3>
        <table class="orders-table items">
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Category</th>
                    <th>Sub Category</th>
                </tr>
            </thead>
            <tbody>
    `;

    orderItems.forEach(item => {
        tableContent += `
            <tr>
                <td><img src="images/products/${item.product.image}" class="order-image" /></td>
                <td class="order-name">${item.product.name}</td>
                <td class="order-price">${item.product.price}</td>
                <td class="order-quantity">${item.quantity}</td>
                <td class="order-category">${item.product.category.name}</td>
                <td class="order-subCategory">${item.product.subCategory.name}</td>
            </tr>
        `;
    });

    tableContent += `
            </tbody>
        </table>
    `;

    popupBody.innerHTML = tableContent;

}

function openPopupWindow(popup, popupOverlay, order_id, callback) {
    popup.style.display = 'block';
    popupOverlay.style.display = 'block';
    if (order_id) {
        callback(order_id, popup);
    } else {
        callback(popup)
    }
}

function closePopupWindow(popup, popupOverlay) {
    popup.style.display = 'none';
    popupOverlay.style.display = 'none';
}

async function renderProductForm(popup) {
    const popupBody = popup.querySelector('.popup-body');

    popupBody.innerHTML = `
                <form method="post" class="productForm">
                <div class="product-input">
                    <label>Product Name</label>
                    <input type="text" name="name" id="name" placeholder="Enter product name">
                </div>
                <div class="categories">
                    <div class="product-input">
                        <label for="category">Category</label>
                        <select name="Category" id="category" form="productForm"></select>
                    </div>
                    <div class="product-input">
                        <label for="sub-category">Sub Category</label>
                        <select name="subCategory" id="subCategory" form="productForm"></select>
                    </div>
                </div>
                <div class="product-input">
                    <label for="description">Description</label>
                    <textarea type="text" name="description" id="description" placeholder="Description"></textarea>
                </div>
                <div class="product-input">
                    <label for="summary">Summary</label>
                    <textarea type="text" name="summary" id="summary" placeholder="Summary"></textarea>
                </div>
                <div class="product-input">
                    <label for="price">Price</label>
                    <input type="number " name="price" id="price">
                </div>
                <div class="product-input">
                    <label for="quantity">Quantity</label>
                    <input type="number " name="quantity" id="quantity">
                </div>
                <div class="product-input img">
                    <label for="image">Select image:</label>
                    <input type="file" id="image" name="image" accept="image/*"  required>
                </div>
                <input class="submit" type="submit" value="Submit">
            </form>
    `;

    const productForm = document.querySelector('.productForm');
    await initializeCategories();

    // Form submition
    productForm.addEventListener('submit', (e) => submitProductForm(e, productForm));

}

async function submitProductForm(e, form) {
    e.preventDefault();
    const categoryDropdown = document.getElementById('category');
    const subCategoryDropdown = document.getElementById('subCategory');

    const categoryId = categoryDropdown.options[categoryDropdown.selectedIndex].id;
    const subCategoryId = subCategoryDropdown.options[subCategoryDropdown.selectedIndex].id;

    const formData = new FormData();    // you must to use FormData object to send files
    formData.append('name', form.name.value);
    formData.append('category_id', categoryId);
    formData.append('subCategory_id', subCategoryId);
    formData.append('description', form.description.value);
    formData.append('summary', form.summary.value);
    formData.append('price', form.price.value);
    formData.append('quantity', form.quantity.value);
    formData.append('image', form.image.files[0]);

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData,
            })

        if (!response.ok) {
            console.log(await response.json())
            alert('Failed to uplad product');
            return;
        } else {
            location.reload();
        }
    } catch (error) {
        console.error('Error uploading product:', error);
        alert('Something went wrong!');
    }
}

async function initializeCategories() {
    const categoryDropdown = document.getElementById('category');
    const subCategoryDropdown = document.getElementById('subCategory');
    const categorySubCategoryMap = new Map();

    const categoriesList = await fetchCategories();

    categoryDropdown.innerHTML += `<option value="">Select category</option>`;

    categoriesList.forEach(category => {
        categoryDropdown.innerHTML += `<option id="${category.id}" value="${category.name}">${category.name}</option>`;
        categorySubCategoryMap.set(category.name, category.subCategories);
    });

    categoryDropdown.addEventListener('change', function () {
        const selectedCategoryName = this.value;
        const subCategoriesList = categorySubCategoryMap.get(selectedCategoryName);

        subCategoryDropdown.innerHTML = '<option value="">Select Subcategory</option>';

        if (subCategoriesList) {
            subCategoriesList.forEach(subCategory => {
                subCategoryDropdown.innerHTML += `<option id="${subCategory.id}" value="${subCategory.name}">${subCategory.name}</option>`;
            });
        }
    });
}

async function fetchOrder(id) {
    try {
        const response = await fetch(`/api/v1/order/${id}`);

        if (!response.ok) {
            console.error("Failed to fetch order");
        }

        return await response.json();
    } catch (error) {
        console.log(error);
    }
}
