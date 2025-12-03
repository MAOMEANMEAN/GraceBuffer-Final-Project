// Enhanced Product Detail - Merged drink and pastry functionality with stock management


const baseUrl = "https://gracebuffer-api.srengchipor.dev/api/v1/";

// State management
let currentStock = 0;
let quantity = 0;
let selectedSugarLevel = 0;
let productPrice = 0;
let currentProductId = null;
let currentProductType = null; // 'drink' or 'pastry'

// ============================================
// URL & PRODUCT FETCHING
// ============================================

function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}
// const productUuid = urlParams.get('id');
// console.log("uuid", productUuid);


function detectProductType() {
  // Detect from current page URL
  const path = window.location.pathname;
  if (path.includes('drink-detail')) return 'drink';
  if (path.includes('pastry-detail')) return 'pastry';
  return 'drink'; // default
}

async function getProductById(productId) {
  try {
    const response = await fetch(`${baseUrl}products/${productId}`, {
      method: 'GET',
      headers: { 'accept': '*/*' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Product data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// ============================================
// STOCK MANAGEMENT
// ============================================

async function updateStockInAPI(productId, newStock) {
  try {
    const response = await fetch(`${baseUrl}products/${productId}/stock`, {
      method: 'PATCH',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stock: newStock })
    });
    
    if (!response.ok) {
      console.warn('Stock update endpoint not available');
      return false;
    }
    
    const data = await response.json();
    console.log('Stock updated in API:', data);
    return true;
  } catch (error) {
    console.warn('API stock update failed:', error);
    return false;
  }
}

function updateStockDisplay(stock) {
  const stockElement = document.getElementById('current-stock');
  const stockWarning = document.getElementById('stock-warning');
  const warningMessage = document.getElementById('warning-message');
  const increaseBtn = document.getElementById('increase-btn');
  const addToCartBtn = document.getElementById('add-to-cart');
  
  if (!stockElement) return; // Skip if stock elements don't exist (for drinks without stock)
  
  currentStock = stock;
  stockElement.textContent = stock;
  
  // Stock warnings
  if (stock === 0) {
    stockWarning.classList.remove('hidden');
    warningMessage.textContent = 'Out of stock!';
    stockElement.classList.remove('text-blue-600', 'text-orange-600');
    stockElement.classList.add('text-red-600');
    increaseBtn.disabled = true;
    addToCartBtn.disabled = true;
  } else if (stock <= 5) {
    stockWarning.classList.remove('hidden');
    warningMessage.textContent = `Only ${stock} items left!`;
    stockElement.classList.remove('text-blue-600', 'text-red-600');
    stockElement.classList.add('text-orange-600');
    increaseBtn.disabled = false;
  } else {
    stockWarning.classList.add('hidden');
    stockElement.classList.remove('text-red-600', 'text-orange-600');
    stockElement.classList.add('text-blue-600');
    increaseBtn.disabled = false;
  }
  
  if (quantity >= stock) {
    increaseBtn.disabled = true;
  }
}

// ============================================
// DISPLAY PRODUCT DETAILS
// ============================================

async function displayProductDetail() {
  const loadingElement = document.getElementById('loading');
  const mainContent = document.getElementById('main-content');
  
  const productId = getProductIdFromUrl();
  console.log("uuid", productId);
  currentProductId = productId;
  currentProductType = detectProductType();
  
  if (!productId) {
    alert('No product UUID provided!');
    window.location.href = currentProductType === 'drink' ? 'menu-drink.html' : 'menu-pastry.html';
    return;
  }
  
  // Show loading
  loadingElement.style.display = 'flex';
  mainContent.classList.add('hidden');
  
  // Fetch product
  const response = await getProductById(productId);
  
  // Hide loading
  loadingElement.style.display = 'none';
  
  if (!response || !response.data) {
    alert('Product not found!');
    window.location.href = currentProductType === 'drink' ? 'menu-drink.html' : 'menu-pastry.html';
    return;
  }
  
  const product = response.data;
  
  // Show content
  mainContent.classList.remove('hidden');
  
  // Update product information
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-description').textContent = product.description;
  document.getElementById('product-price').textContent = `$ ${product.price}`;
  
  // Store price
  productPrice = parseFloat(product.price);
  
  // Handle stock (for pastries)
  if (currentProductType === 'pastry') {
    const stock = product.stock !== undefined ? product.stock : 50;
    updateStockDisplay(stock);
  }
  
  // Set main image
  const mainImage = document.getElementById('main-image');
  mainImage.src = product.thumbnail || product.images || 'https://via.placeholder.com/400x300?text=Product';
  mainImage.alt = product.name;
  
  // Display thumbnails
  displayThumbnails(product);
  
  // Update total price
  updateTotalPrice();
  
  // Load suggestions
  loadSuggestions(productId);
}

function displayThumbnails(product) {
  const thumbnailContainer = document.getElementById('thumbnail-container');
  const mainImage = document.getElementById('main-image');
  
  const images = product.images && Array.isArray(product.images) ? product.images : 
                 [product.thumbnail, product.thumbnail, product.thumbnail];
  
  thumbnailContainer.innerHTML = '';
  
  images.slice(0, 3).forEach((imageUrl, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'bg-pink-50 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-500 transition';
    thumb.innerHTML = `
      <img src="${imageUrl || product.thumbnail || 'https://via.placeholder.com/200x150?text=Product'}" 
           alt="Thumbnail ${index + 1}" 
           class="w-full h-24 object-cover">
    `;
    
    thumb.addEventListener('click', () => {
      mainImage.src = imageUrl || product.thumbnail;
    });
    
    thumbnailContainer.appendChild(thumb);
  });
}

// ============================================
// QUANTITY & PRICE CONTROLS
// ============================================

function updateTotalPrice() {
  const totalPriceElement = document.getElementById('total-price');
  if (totalPriceElement) {
    const total = (productPrice * quantity).toFixed(2);
    totalPriceElement.textContent = `$ ${total}`;
  }
}

function setupQuantityControls() {
  const quantityDisplay = document.getElementById('quantity');
  const increaseBtn = document.getElementById('increase-btn');
  const decreaseBtn = document.getElementById('decrease-btn');
  const addToCartBtn = document.getElementById('add-to-cart');
  
  increaseBtn.addEventListener('click', () => {
    // For pastries, check stock
    if (currentProductType === 'pastry' && quantity >= currentStock) {
      return;
    }
    
    quantity++;
    quantityDisplay.textContent = quantity;
    updateTotalPrice();
    decreaseBtn.disabled = false;
    addToCartBtn.disabled = false;
    
    // Disable if reached stock limit (pastries only)
    if (currentProductType === 'pastry' && quantity >= currentStock) {
      increaseBtn.disabled = true;
    }
  });
  
  decreaseBtn.addEventListener('click', () => {
    if (quantity > 0) {
      quantity--;
      quantityDisplay.textContent = quantity;
      updateTotalPrice();
      increaseBtn.disabled = false;
      
      if (quantity === 0) {
        decreaseBtn.disabled = true;
        addToCartBtn.disabled = currentProductType === 'pastry' && currentStock === 0;
      }
    }
  });
  
  // Initial state
  decreaseBtn.disabled = true;
  addToCartBtn.disabled = true;
}

// ============================================
// SUGAR LEVEL (for drinks only)
// ============================================

function setupSugarLevelControls() {
  const sugarBtns = document.querySelectorAll('.sugar-btn');
  
  if (sugarBtns.length === 0) return; // Skip if no sugar buttons (pastries)
  
  sugarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sugarBtns.forEach(b => {
        b.classList.remove('bg-pink-200', 'border-pink-500');
        b.classList.add('border-pink-300');
      });
      
      btn.classList.add('bg-pink-200', 'border-pink-500');
      btn.classList.remove('border-pink-300');
      
      selectedSugarLevel = btn.dataset.level;
    });
  });
}

// ============================================
// ADD TO CART
// ============================================

async function processOrder(orderQuantity) {
  if (orderQuantity === 0) return false;
  
  // For pastries, check and update stock
  if (currentProductType === 'pastry') {
    if (orderQuantity > currentStock) return false;
    
    const newStock = currentStock - orderQuantity;
    await updateStockInAPI(currentProductId, newStock);
    updateStockDisplay(newStock);
  }
  
  // Create order record (could be saved to API or localStorage)
  const order = {
    productId: currentProductId,
    productType: currentProductType,
    quantity: orderQuantity,
    sugarLevel: currentProductType === 'drink' ? selectedSugarLevel : null,
    timestamp: new Date().toISOString(),
    totalPrice: (productPrice * orderQuantity).toFixed(2)
  };
  
  console.log('Order processed:', order);
  return true;
}

function setupAddToCart() {
  const addToCartBtn = document.getElementById('add-to-cart');
  const productName = document.getElementById('product-name');
  const quantityDisplay = document.getElementById('quantity');
  
  addToCartBtn.addEventListener('click', async () => {
    if (quantity === 0) {
      alert('Please select quantity!');
      return;
    }
    
    // For pastries, check stock
    if (currentProductType === 'pastry' && quantity > currentStock) {
      alert('Not enough stock available!');
      return;
    }
    
    // Show loading
    addToCartBtn.disabled = true;
    const originalText = addToCartBtn.innerHTML;
    addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
    
    // Process order
    const success = await processOrder(quantity);
    
    if (success) {
      let message = `✅ Added to cart!\n\n${productName.textContent}\nQuantity: ${quantity}`;
      
      if (currentProductType === 'drink') {
        message += `\nSugar Level: ${selectedSugarLevel}%`;
      } else {
        message += `\n\n📦 Remaining Stock: ${currentStock} items`;
      }
      
      message += `\nTotal: $ ${(productPrice * quantity).toFixed(2)}`;
      
      alert(message);
      
      // Reset
      quantity = 0;
      quantityDisplay.textContent = '0';
      document.getElementById('decrease-btn').disabled = true;
      updateTotalPrice();
      
      addToCartBtn.innerHTML = originalText;
      addToCartBtn.disabled = currentProductType === 'pastry' && currentStock === 0;
    } else {
      alert('Failed to process order. Please try again.');
      addToCartBtn.innerHTML = originalText;
      addToCartBtn.disabled = false;
    }
  });
}

// ============================================
// SUGGESTIONS
// ============================================

async function loadSuggestions(currentProductId) {
  const suggestionsContainer = document.getElementById('suggestions-container');
  
  try {
    // Get categories
    const categoriesResponse = await fetch(`${baseUrl}categories`, {
      method: 'GET',
      headers: { 'accept': '*/*' }
    });
    
    if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
    
    const categoriesData = await categoriesResponse.json();
    const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData.data;
    
    // Find opposite category (if viewing drink, show pastries, and vice versa)
    const suggestionCategoryName = currentProductType === 'drink' ? 'pastry' : 'drink';
    const category = categories.find(cat => cat.name.toLowerCase() === suggestionCategoryName);
    
    if (!category) {
      suggestionsContainer.innerHTML = '<p class="text-gray-600">No suggestions available</p>';
      return;
    }
    
    // Fetch products by category
    const response = await fetch(
      `${baseUrl}products/get-by-category/${category.uuid}?page=0&size=5`,
      { method: 'GET', headers: { 'accept': '*/*' } }
    );
    
    if (!response.ok) throw new Error('Failed to fetch suggestions');
    
    const data = await response.json();
    
    if (!data || !data.data || !data.data.content) {
      suggestionsContainer.innerHTML = '<p class="text-gray-600">No suggestions available</p>';
      return;
    }
    
    const suggestions = data.data.content.slice(0, 4);
    
    suggestionsContainer.innerHTML = '';
    
    suggestions.forEach(item => {
      const itemStock = item.stock !== undefined ? item.stock : 50;
      const showStock = suggestionCategoryName === 'pastry';
      
      let stockBadge = '';
      let stockColor = '';
      
      if (showStock) {
        if (itemStock === 0) {
          stockBadge = 'Out of Stock';
          stockColor = 'text-red-600';
        } else if (itemStock <= 5) {
          stockBadge = `Only ${itemStock} left`;
          stockColor = 'text-orange-600';
        } else {
          stockBadge = `${itemStock} available`;
          stockColor = 'text-green-600';
        }
      }
      
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col';
      card.style.height = '350px';
      card.innerHTML = `
        <div class="relative overflow-hidden" style="height: 192px;">
          <img src="${item.thumbnail || item.images || 'https://via.placeholder.com/300x200?text=Product'}" 
               alt="${item.name}" 
               class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
          ${showStock ? `
            <div class="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-semibold ${stockColor}">
              <i class="fas fa-box mr-1"></i>${stockBadge}
            </div>
          ` : ''}
        </div>
        <div class="p-4 flex flex-col flex-1">
          <h3 class="font-semibold font-primary text-lg mb-2 text-gray-800 line-clamp-1">${item.name}</h3>
          <p class="text-gray-600 font-primary text-sm mb-3 line-clamp-2">${item.description}</p>
          <div class="flex justify-between items-center mt-auto">
            <span class="text-secondary font-semibold font-primary text-xl">$${item.price}</span>
            <button class="bg-secondary font-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition text-sm font-medium ${showStock && itemStock === 0 ? 'opacity-50 cursor-not-allowed' : ''}" 
                    ${showStock && itemStock === 0 ? 'disabled' : ''}>
              ${showStock && itemStock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
            </button>
          </div>
        </div>
      `;
      
      if (!showStock || itemStock > 0) {
        card.addEventListener('click', (e) => {
          if (!e.target.closest('button')) {
            const targetPage = suggestionCategoryName === 'drink' ? 'drink-detail.html' : 'pastry-detail.html';
            window.location.href = `${targetPage}?id=${item.uuid}`;
          }
        });
      }
      
      suggestionsContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading suggestions:', error);
    suggestionsContainer.innerHTML = '<p class="text-gray-600">No suggestions available</p>';
  }
}

// ============================================
// REVIEW MODAL & DISPLAY
// ============================================

// Fetch reviews for a product
async function fetchReviews(productUuid) {
  try {
    const response = await fetch(`${baseUrl}reviews/products/${productUuid}`, {
      method: 'GET',
      headers: { 'accept': '*/*' }
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch reviews:', response.status);
      return [];
    }
    
    const data = await response.json();
    console.log('Reviews data:', data);
    
    // The API returns an array directly
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

// Display reviews
async function displayReviews() {
  const reviewsContainer = document.getElementById('reviews-container');
  
  if (!reviewsContainer) {
    console.log('Reviews container not found on this page');
    return;
  }
  
  const reviews = await fetchReviews(currentProductId);
  
  if (!reviews || reviews.length === 0) {
    reviewsContainer.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-comments text-gray-300 text-5xl mb-4"></i>
        <p class="text-gray-500 text-lg">No reviews yet. Be the first to review!</p>
      </div>
    `;
    return;
  }
  
  reviewsContainer.innerHTML = reviews.map(review => `
    <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-pink-400 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-white text-lg"></i>
          </div>
          <div>
            <p class="font-semibold text-gray-800">${review.createdBy || 'Anonymous User'}</p>
            <p class="text-sm text-gray-500">${formatDate(review.createdAt)}</p>
          </div>
        </div>
      </div>
      <p class="text-gray-700 leading-relaxed">${review.comment}</p>
      ${review.isDeleted ? '<span class="text-red-500 text-xs mt-2 inline-block">[Deleted]</span>' : ''}
    </div>
  `).join('');
}

// Format date helper
function formatDate(dateString) {
  if (!dateString) return 'Recently';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Recently';
  }
}

async function submitReview(productUuid, comment) {
  try {
    const response = await fetch(`${baseUrl}reviews/${productUuid}`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Failed to submit review:', errorData);
      throw new Error('Failed to submit review');
    }
    
    const data = await response.json();
    console.log('Review submitted:', data);
    return data;
  } catch (error) {
    console.error('Error submitting review:', error);
    return null;
  }
}

function setupReviewModal() {
  const reviewBtn = document.getElementById('review-btn');
  const reviewModal = document.getElementById('review-modal');
  const closeModal = document.getElementById('close-modal');
  const cancelReview = document.getElementById('cancel-review');
  const submitReviewBtn = document.getElementById('submit-review');
  const reviewComment = document.getElementById('review-comment');
  
  if (!reviewBtn || !reviewModal) return;
  
  reviewBtn.addEventListener('click', () => {
    reviewModal.classList.add('active');
  });
  
  const closeModalFunc = () => {
    reviewModal.classList.remove('active');
    reviewComment.value = '';
  };
  
  closeModal.addEventListener('click', closeModalFunc);
  cancelReview.addEventListener('click', closeModalFunc);
  
  reviewModal.addEventListener('click', (e) => {
    if (e.target === reviewModal) closeModalFunc();
  });
  
  submitReviewBtn.addEventListener('click', async () => {
    const comment = reviewComment.value.trim();
    
    if (!comment) {
      alert('Please write a comment!');
      return;
    }
    
    submitReviewBtn.disabled = true;
    submitReviewBtn.textContent = 'Submitting...';
    
    const result = await submitReview(currentProductId, comment);
    
    submitReviewBtn.disabled = false;
    submitReviewBtn.textContent = 'Submit Review';
    
    if (result) {
      alert('✅ Review submitted successfully!');
      closeModalFunc();
      
      // Reload reviews to show the new one
      await displayReviews();
      
      // Scroll to reviews section if it exists
      const reviewsSection = document.getElementById('reviews-section');
      if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      alert('❌ Failed to submit review. Please try again.');
    }
  });
}

// ============================================
// INITIALIZE
// ============================================

window.addEventListener('DOMContentLoaded', () => {
  displayProductDetail();
  setupQuantityControls();
  setupSugarLevelControls();
  setupAddToCart();
  setupReviewModal();
  displayReviews(); // Load reviews on page load
});