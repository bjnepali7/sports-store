// Generate a random cart ID if none exists
let cartId = localStorage.getItem('cartId');
if (!cartId) {
    cartId = 'cart_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cartId', cartId);
}

// Product data
let products = [];

// Function to create product card HTML
/**
 * Creates the HTML for a product card.
 * 
 * @param {Object} product - The product data.
 * @returns {string} The HTML for the product card.
 */
function createProductCard(product) {
    return `
        <div class="product-card" data-category="${product.category}">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p class="stock">In Stock: ${product.stock}</p>
            <button onclick="addToCart(${product.id})" class="btn btn-primary">Add to Cart</button>
        </div>
    `;
}

// Function to fetch all products from the server
/**
 * Fetches all products from the server.
 * 
 * @async
 * @returns {Promise<Object[]>} A promise that resolves to an array of product data.
 */
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Function to fetch and display featured products
/**
 * Fetches and displays featured products.
 * 
 * @async
 * @returns {Promise<Object[]>} A promise that resolves to an array of featured product data.
 */
async function fetchFeaturedProducts() {
    try {
        const response = await fetch('/api/products/featured');
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }
}

// Function to fetch the current cart contents
/**
 * Fetches the current cart contents.
 * 
 * @async
 * @returns {Promise<Object>} A promise that resolves to the cart data.
 */
async function fetchCart() {
    try {
        const response = await fetch(`/api/cart/${cartId}`);
        const cart = await response.json();
        return cart;
    } catch (error) {
        console.error('Error fetching cart:', error);
        return { items: [] };
    }
}

// Function to add a product to the shopping cart
/**
 * Adds a product to the shopping cart.
 * 
 * @async
 * @param {number} productId - The ID of the product to add.
 */
async function addToCart(productId) {
    try {
        // Send POST request to add item to cart
        const response = await fetch(`/api/cart/${cartId}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId.toString(),
                quantity: 1
            })
        });
        
        if (response.ok) {
            // Show success message
            alert('Product added to cart!');
            updateCartCount();
        } else {
            throw new Error('Failed to add product to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add product to cart. Please try again.');
    }
}

// Function to update the cart count in the navigation
/**
 * Updates the cart count in the navigation.
 * 
 * @async
 */
async function updateCartCount() {
    try {
        // Fetch current cart contents
        const cart = await fetchCart();
        
        // Update the cart count display
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Initialize cart count
updateCartCount();

// Fetch products on page load
fetchProducts();
