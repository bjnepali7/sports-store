// Get cart ID from local storage or create new one
const cartId = localStorage.getItem('cartId') || `cart_${Math.random().toString(36).substring(2, 12)}`;
localStorage.setItem('cartId', cartId);

// Function to fetch cart data
async function fetchCart() {
    try {
        const response = await fetch(`/api/cart/${cartId}`);
        if (!response.ok) throw new Error('Failed to fetch cart');
        return await response.json();
    } catch (error) {
        console.error('Error fetching cart:', error);
        return { items: [] };
    }
}

// Function to display cart contents
async function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems || !cartTotal) return;

    try {
        const cart = await fetchCart();
        
        // Show message if cart is empty
        if (!cart.items || cart.items.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty.</p>';
            cartTotal.textContent = '0.00';
            return;
        }
        
        // Calculate total and display cart items
        let total = 0;
        cartItems.innerHTML = cart.items.map(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            return `
                <div class="cart-item" data-product-id="${item.productId}">
                    <img src="/images/${item.productId}.jpg" alt="${item.name}" 
                         onerror="this.src='/images/placeholder.jpg'">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>Price: $${item.price.toFixed(2)}</p>
                        <div class="quantity-controls">
                            <button onclick="updateQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity('${item.productId}', ${item.quantity + 1})">+</button>
                        </div>
                        <p>Subtotal: $${subtotal.toFixed(2)}</p>
                        <button onclick="removeFromCart('${item.productId}')" class="btn btn-danger">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Update total price
        cartTotal.textContent = total.toFixed(2);
    } catch (error) {
        console.error('Error displaying cart:', error);
        cartItems.innerHTML = '<p>Error loading cart. Please try again.</p>';
    }
}

// Function to update item quantity
async function updateQuantity(productId, newQuantity) {
    try {
        // Remove item if quantity is 0 or less
        if (newQuantity < 1) {
            await removeFromCart(productId);
            return;
        }
        
        const response = await fetch(`/api/cart/${cartId}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: newQuantity })
        });

        if (!response.ok) throw new Error('Failed to update quantity');
        
        await displayCart();
        updateCartCount();
    } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Failed to update quantity. Please try again.');
    }
}

// Function to remove item from cart
async function removeFromCart(productId) {
    try {
        const response = await fetch(`/api/cart/${cartId}/remove/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to remove item');
        
        await displayCart();
        updateCartCount();
    } catch (error) {
        console.error('Error removing item:', error);
        alert('Failed to remove item. Please try again.');
    }
}

// Function to update cart count in navigation
async function updateCartCount() {
    try {
        const cart = await fetchCart();
        const cartCount = document.getElementById('cart-count');
        if (cartCount && cart.items) {
            const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Handle checkout process
document.getElementById('checkout-btn')?.addEventListener('click', async () => {
    try {
        const cart = await fetchCart();
        if (!cart.items || cart.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Save cart data to localStorage for checkout page
        localStorage.setItem('cart', JSON.stringify(cart.items));
        
        // Redirect to checkout page
        window.location.href = '/checkout.html';
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('Failed to process checkout. Please try again.');
    }
});

// Initialize cart display when page loads
document.addEventListener('DOMContentLoaded', () => {
    displayCart();
    updateCartCount();
});
