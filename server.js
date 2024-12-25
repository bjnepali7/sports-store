// Import required packages
const express = require('express');         // Web framework for Node.js
const bodyParser = require('body-parser');  // Middleware to parse JSON requests
const fs = require('fs').promises;          // File system module with promises
const path = require('path');               // Path module for handling file paths

// Create Express app and set port
const app = express();
const PORT = 3000;

// Set up middleware
app.use(bodyParser.json());                 // Parse JSON request bodies
app.use(express.json());                    // Parse JSON request bodies
app.use(express.static('public'));          // Serve static files from 'public' directory

// Helper function to read JSON files
async function readJsonFile(filename) {
    // Read and parse JSON file from the data directory
    const data = await fs.readFile(path.join(__dirname, 'data', filename), 'utf8');
    return JSON.parse(data);
}

// Helper function to write JSON files
async function writeJsonFile(filename, data) {
    // Write data to JSON file with proper formatting
    await fs.writeFile(
        path.join(__dirname, 'data', filename),
        JSON.stringify(data, null, 2),
        'utf8'
    );
}

// Checkout endpoint
app.post('/api/checkout', async (req, res) => {
    try {
        // In a real app, you would process the order here
        res.json({ message: 'Order processed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Checkout failed' });
    }
});

// API Routes

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const data = await readJsonFile('products.json');
        res.json(data.products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get featured products for homepage
app.get('/api/products/featured', async (req, res) => {
    try {
        const data = await readJsonFile('products.json');
        const featured = data.products.filter(product => product.featured);
        res.json(featured);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch featured products' });
    }
});

// Get a specific product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const data = await readJsonFile('products.json');
        const product = data.products.find(p => p.id === parseInt(req.params.id));
        
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Cart Management Routes

// Get cart contents
app.get('/api/cart/:cartId', async (req, res) => {
    try {
        const cartsData = await readJsonFile('carts.json');
        const cart = cartsData.carts[req.params.cartId] || { items: [] };
        
        if (!cartsData.carts[req.params.cartId]) {
            cartsData.carts[req.params.cartId] = cart;
            await writeJsonFile('carts.json', cartsData);
        }
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Add item to cart
app.post('/api/cart/:cartId/add', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cartsData = await readJsonFile('carts.json');
        const productsData = await readJsonFile('products.json');
        
        // Initialize cart if it doesn't exist
        if (!cartsData.carts[req.params.cartId]) {
            cartsData.carts[req.params.cartId] = { items: [] };
        }
        
        const cart = cartsData.carts[req.params.cartId];
        const product = productsData.products.find(p => p.id === parseInt(productId));
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const existingItem = cart.items.find(item => item.productId === productId.toString());
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId: productId.toString(),
                quantity: quantity,
                name: product.name,
                price: product.price
            });
        }
        
        await writeJsonFile('carts.json', cartsData);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// Update cart item quantity
app.put('/api/cart/:cartId/update', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cartsData = await readJsonFile('carts.json');
        
        if (!cartsData.carts[req.params.cartId]) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        
        const cart = cartsData.carts[req.params.cartId];
        const itemIndex = cart.items.findIndex(item => item.productId === productId.toString());
        
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        
        if (quantity > 0) {
            cart.items[itemIndex].quantity = quantity;
        } else {
            cart.items = cart.items.filter(item => item.productId !== productId.toString());
        }
        
        await writeJsonFile('carts.json', cartsData);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// Remove item from cart
app.delete('/api/cart/:cartId/remove/:productId', async (req, res) => {
    try {
        const cartsData = await readJsonFile('carts.json');
        
        if (!cartsData.carts[req.params.cartId]) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        
        const cart = cartsData.carts[req.params.cartId];
        cart.items = cart.items.filter(item => item.productId !== req.params.productId.toString());
        
        await writeJsonFile('carts.json', cartsData);
        res.json(cart);
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
