// store/get-data.js - Fetch data from API

const baseUrl = "https://gracebuffer-api.srengchipor.dev/api/v1/";

// Export getData function for use in other modules
export async function getData(endpoint, page = 0, size = 20) {
  try {
    const response = await fetch(`${baseUrl}${endpoint}?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'accept': '*/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`${endpoint} data:`, data);
    
    // Return the content array
    if (data && data.data && data.data.content) {
      return data.data.content;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

// Export getDrinks for backward compatibility
export async function getDrinks(page = 0, size = 20) {
  try {
    const response = await fetch(`${baseUrl}products?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'accept': '*/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Drinks data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching drinks:', error);
    return null;
  }
}
// Function to get all categories
async function getCategories() {
  try {
    const response = await fetch(`${baseUrl}categories`, {
      method: 'GET',
      headers: {
        'accept': '*/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return null;
  }
}

// Function to get products by category UUID
async function getProductsByCategory(categoryUuid, page = 0, size = 20) {
  try {
    const response = await fetch(
      `${baseUrl}products/get-by-category/${categoryUuid}?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'accept': '*/*'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Products by category:', data);
    return data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return null;
  }
}

// Function to find category UUID by name
async function getCategoryUuid(categoryName) {
  const categories = await getCategories();
  
  if (!categories || !Array.isArray(categories)) {
    console.error('No categories found');
    return null;
  }
  
  // Find category by name (case-insensitive)
  const category = categories.find(
    cat => cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  
  if (category) {
    console.log(`Found category "${categoryName}":`, category);
    return category.uuid;
  } else {
    console.error(`Category "${categoryName}" not found`);
    return null;
  }
}

// Function to display drinks (filtered by "Drink" category)
async function displayDrinks() {
  const drinksContainer = document.getElementById('drinks-container');
  const loadingElement = document.getElementById('loading');
  
  if (!drinksContainer) {
    console.error('Container element with id="drinks-container" not found');
    return;
  }
  
  // Show loading
  if (loadingElement) {
    loadingElement.style.display = 'block';
  }
  
  // Get "Drink" category UUID
  const drinkCategoryUuid = await getCategoryUuid('Drink');
  
  if (!drinkCategoryUuid) {
    if (loadingElement) loadingElement.style.display = 'none';
    drinksContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">Drink category not found</p>';
    return;
  }
  
  // Fetch drinks by category
  const response = await getProductsByCategory(drinkCategoryUuid);
  
  // Hide loading
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  
  // Check if we have data
  if (!response || !response.data || !response.data.content || response.data.content.length === 0) {
    drinksContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">No drinks available</p>';
    return;
  }
  
  const drinks = response.data.content;
  
  // Clear existing content
  drinksContainer.innerHTML = '';
  
  // Loop through drinks and create HTML for each
  drinks.forEach(drink => {
    const productId = drink.uuid;
    
    if (!productId) {
      console.warn('No UUID found for product:', drink.name);
      return;
    }
    
    const drinkCard = document.createElement('div');
    drinkCard.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group';
    
    drinkCard.innerHTML = `
      <div class="relative overflow-hidden">
        <img 
          src="${drink.thumbnail || drink.images || 'https://via.placeholder.com/400x300?text=Drink'}" 
          alt="${drink.name}"
          class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div class="p-6">
        <h3 class="text-xl font-semibold font-primary text-gray-800 mb-2 group-hover:text-secondary transition-colors">
          ${drink.name}
        </h3>
        <p class="text-gray-600 mb-4 line-clamp-2">
          ${drink.description || 'Delicious beverage made with quality ingredients'}
        </p>
        <div class="flex justify-between items-center">
          <span class="text-2xl font-bold font-primary text-secondary">$${drink.price}</span>
          <button 
            class="add-to-cart-btn bg-secondary font-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors font-medium"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    `;
    
    // Add click event to the entire card
    drinkCard.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart-btn')) {
        e.stopPropagation();
        alert(`Added ${drink.name} to cart!\nPrice: $${drink.price}`);
      } else {
        if (productId) {
          window.location.href = `drink-detail.html?id=${productId}`;
        } else {
          alert('Product ID not found!');
        }
      }
    });
    
    drinksContainer.appendChild(drinkCard);
  });
}

// Function to display pastries (filtered by "Pastry" category)
async function displayPastries() {
  const pastriesContainer = document.getElementById('pastries-container');
  const loadingElement = document.getElementById('loading');
  
  if (!pastriesContainer) {
    console.error('Container element with id="pastries-container" not found');
    return;
  }
  
  // Show loading
  if (loadingElement) {
    loadingElement.style.display = 'block';
  }
  
  // Get "Pastry" category UUID
  const pastryCategoryUuid = await getCategoryUuid('Pastry');
  
  if (!pastryCategoryUuid) {
    if (loadingElement) loadingElement.style.display = 'none';
    pastriesContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">Pastry category not found</p>';
    return;
  }
  
  // Fetch pastries by category
  const response = await getProductsByCategory(pastryCategoryUuid);
  
  // Hide loading
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  
  // Check if we have data
  if (!response || !response.data || !response.data.content || response.data.content.length === 0) {
    pastriesContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">No pastries available</p>';
    return;
  }
  
  const pastries = response.data.content;
  
  // Clear existing content
  pastriesContainer.innerHTML = '';
  
  // Loop through pastries and create HTML for each
  pastries.forEach(pastry => {
    const productId = pastry.uuid;
    
    if (!productId) {
      console.warn('No UUID found for product:', pastry.name);
      return;
    }
    
    const pastryCard = document.createElement('div');
    pastryCard.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group';
    
    pastryCard.innerHTML = `
      <div class="relative overflow-hidden">
        <img 
          src="${pastry.thumbnail || pastry.images || 'https://via.placeholder.com/400x300?text=Pastry'}" 
          alt="${pastry.name}"
          class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div class="p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-2 group-hover:text-secondary transition-colors">
          ${pastry.name}
        </h3>
        <p class="text-gray-600 mb-4 line-clamp-2">
          ${pastry.description || 'Delicious pastry made with quality ingredients'}
        </p>
        <div class="flex justify-between items-center">
          <span class="text-2xl font-bold text-secondary">$${pastry.price}</span>
          <button 
            class="add-to-cart-btn bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors font-medium"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    `;
    
    // Add click event to the entire card
    pastryCard.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart-btn')) {
        e.stopPropagation();
        alert(`Added ${pastry.name} to cart!\nPrice: $${pastry.price}`);
      } else {
        if (productId) {
          window.location.href = `pastry-detail.html?id=${productId}`;
        } else {
          alert('Product ID not found!');
        }
      }
    });
    
    pastriesContainer.appendChild(pastryCard);
  });
}

// Call appropriate function based on page
window.addEventListener('DOMContentLoaded', () => {
  // Check which page we're on
  const currentPage = window.location.pathname;
  
  if (currentPage.includes('menu-drink')) {
    displayDrinks();
  } else if (currentPage.includes('menu-pastry')) {
    displayPastries();
  }
});