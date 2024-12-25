// Load featured products on homepage
async function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featured-products');
    if (featuredProductsContainer) {
        const featuredProducts = await fetchFeaturedProducts();
        featuredProductsContainer.innerHTML = featuredProducts
            .map(product => createProductCard(product))
            .join('');
    }
}

// Load all products on products page
async function loadAllProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        const products = await fetchProducts();
        productsGrid.innerHTML = products
            .map(product => createProductCard(product))
            .join('');
    }
}

// Filter and sort products
function handleFilters() {
    const categorySelect = document.getElementById('category');
    const sortSelect = document.getElementById('sort');
    
    if (categorySelect && sortSelect) {
        const filterProducts = async () => {
            let products = await fetchProducts();
            
            // Apply category filter
            const selectedCategory = categorySelect.value;
            if (selectedCategory) {
                products = products.filter(
                    product => product.category === selectedCategory
                );
            }
            
            // Apply sorting
            const sortValue = sortSelect.value;
            products.sort((a, b) => {
                if (sortValue === 'price-low') {
                    return a.price - b.price;
                } else if (sortValue === 'price-high') {
                    return b.price - a.price;
                } else {
                    return a.name.localeCompare(b.name);
                }
            });
            
            // Update display
            const productsGrid = document.getElementById('products-grid');
            productsGrid.innerHTML = products
                .map(product => createProductCard(product))
                .join('');
        };
        
        categorySelect.addEventListener('change', filterProducts);
        sortSelect.addEventListener('change', filterProducts);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadFeaturedProducts();
    await loadAllProducts();
    handleFilters();
});
