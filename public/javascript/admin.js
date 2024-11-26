document.addEventListener('DOMContentLoaded', async _ => {
    const orders = await fetchOrders();

    await renderOrders(orders);
    // await addEventListeners3(orders);
})

async function renderOrders(orders) {
    const tbody = document.querySelector('.orders-table tbody');

    // Clear existing rows
    tbody.innerHTML = '';

    orders.forEach(order => {
        const row = document.createElement('tr');

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
            <td>
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
        viewButton.addEventListener('click', () => viewDetails(order.id));
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

// View Details Function
function viewDetails(orderId) {
    alert(`View details for order: ${orderId}`);
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