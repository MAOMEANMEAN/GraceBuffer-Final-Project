

"use strict"
import { getData } from "./get-data.js"

const productData = await getData ("products")
console.log(productData);


// home.js or specific script for this page
import DynamicCard from './components/DynamicCard.js';

async function loadPopularProducts() {
  try {
    // Example API endpoint
    const response = await fetch('/api/v1/products/create/');
    // Or with pagination/limit
    // const response = await fetch('/api/products?limit=8&sort=popularity');
    
    const popularProducts = await response.json();
    
    // Render using DynamicCard component
    const featuredCard = new DynamicCard(popularProducts, 'featured-products');
  } catch (error) {
    console.error('Failed to load popular products:', error);
    // Show error message or fallback products
    showFallbackProducts();
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadPopularProducts);