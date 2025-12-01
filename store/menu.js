// store/menu.js - Menu page product rendering

"use strict";
import { getData } from "./get-data.js";

// Get all products
const productData = await getData("products");
console.log("Menu Products:", productData);

// Get container
const containerCard = document.getElementById("products-grid");

if (!containerCard) {
    console.error("Container with id 'products-grid' not found!");
} else {
    renderMenuProducts(productData);
}

// Render products function
function renderMenuProducts(products) {
    if (!products || products.length === 0) {
        containerCard.innerHTML = '<p class="col-span-full text-center text-gray-600">No products available</p>';
        return;
    }

    containerCard.innerHTML = '';
    containerCard.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';

    products.forEach(product => {
        const productCard = createProductCard(product);
        containerCard.appendChild(productCard);
    });
}

// Create product card element (matching home page style)
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer';
    
    card.innerHTML = `
        <img src="${product.thumbnail || 'https://via.placeholder.com/300x200'}" 
             alt="${product.name}"
             class="w-full h-48 object-cover rounded-t-2xl"
             onerror="this.src='https://via.placeholder.com/300x200'">
        <div class="p-5">
            <h3 class="text-xl font-semibold font-primary mb-2">${product.name}</h3>
            <p class="text-gray-600 font-primary text-sm mb-4 line-clamp-2">${product.description || 'Delicious product'}</p>
            <div class="flex justify-between items-center">
                <span class="text-xl font-semibold font-primary text-secondary">$${product.price.toFixed(2)}</span>
                <button class="add-cart-btn font-primary bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                    ADD TO CART
                </button>
            </div>
        </div>
    `;

    // Click to view detail
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.add-cart-btn')) {
            window.location.href = `./drink-detail.html?id=${product.uuid}`;
        }
    });

    // Add to cart functionality
    const addCartBtn = card.querySelector('.add-cart-btn');
    addCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    });

    return card;
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    let stars = '';
    
    const starSVG = (filled) => `
        <svg class="w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
        </svg>
    `;
    
    for (let i = 0; i < 5; i++) {
        stars += starSVG(i < fullStars);
    }
    
    return stars;
}

// Add to cart function
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.id === product.uuid);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.uuid,
            name: product.name,
            price: product.price,
            thumbnail: product.thumbnail,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
}

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-y-0 transition-all duration-300';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateY(-100px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 2500);
}

// Search functionality
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterProducts(searchTerm, currentCategory);
    });
}

// Filter functionality
let currentCategory = '';
const filterButton = document.getElementById('filterButton');
const dropdownMenu = document.getElementById('dropdownMenu');

if (filterButton && dropdownMenu) {
    filterButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!filterButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    // Filter options
    const filterOptions = dropdownMenu.querySelectorAll('li');
    filterOptions.forEach(option => {
        option.addEventListener('click', () => {
            const filterText = option.textContent.toLowerCase();
            currentCategory = filterText.includes('pastry') ? 'pastry' : 
                            filterText.includes('drink') ? 'drink' : '';
            
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            filterProducts(searchTerm, currentCategory);
            dropdownMenu.classList.add('hidden');
        });
    });
}

// Filter products function
function filterProducts(searchTerm, category) {
    let filteredProducts = productData;

    // Filter by search term
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
    }

    // Filter by category
    if (category) {
        filteredProducts = filteredProducts.filter(product => 
            product.category && product.category.toLowerCase().includes(category)
        );
    }

    renderMenuProducts(filteredProducts);
}

// Initialize cart count on page load
window.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});

// Also update immediately
updateCartCount();