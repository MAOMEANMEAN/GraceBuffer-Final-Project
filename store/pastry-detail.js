import { cardProduct } from "../components/cart.js";

// pastryDetail.js - Complete pastry detail page with cart integration
const baseUrl = "https://gracebuffer-api.srengchipor.dev/api/v1/";

// State management
let currentStock = 0;
let quantity = 0;
let productPrice = 0;
let currentProductId = null;
let currentProduct = null;

// ============================================================================
// API FUNCTIONS
// ============================================================================

function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

async function getProductById(productId) {
  try {
    const response = await fetch(`${baseUrl}products/${productId}`, {
      method: "GET",
      headers: { accept: "*/*" },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Product data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

async function submitReview(productUuid, comment) {
  try {
    const response = await fetch(`${baseUrl}reviews/${productUuid}`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Failed to submit review:", errorData);
      throw new Error("Failed to submit review");
    }

    const data = await response.json();
    console.log("Review submitted:", data);
    return data;
  } catch (error) {
    console.error("Error submitting review:", error);
    return null;
  }
}

async function updateStockInAPI(productId, newStock) {
  try {
    const response = await fetch(`${baseUrl}products/${productId}/stock`, {
      method: "PATCH",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stock: newStock }),
    });

    if (!response.ok) {
      console.warn("Stock update endpoint not available");
      return false;
    }

    const data = await response.json();
    console.log("Stock updated in API:", data);
    return true;
  } catch (error) {
    console.warn("API stock update failed:", error);
    return false;
  }
}

// ============================================================================
// STOCK MANAGEMENT
// ============================================================================

function saveStockToLocalStorage(productId, stock) {
  const stockData = JSON.parse(localStorage.getItem("productStocks") || "{}");
  stockData[productId] = stock;
  localStorage.setItem("productStocks", JSON.stringify(stockData));
}

function getStockFromLocalStorage(productId) {
  const stockData = JSON.parse(localStorage.getItem("productStocks") || "{}");
  return stockData[productId];
}

function updateStockDisplay(stock) {
  const stockElement = document.getElementById("current-stock");
  const stockWarning = document.getElementById("stock-warning");
  const warningMessage = document.getElementById("warning-message");
  const increaseBtn = document.getElementById("increase-btn");
  const addToCartBtn = document.getElementById("add-to-cart");

  currentStock = stock;
  stockElement.textContent = stock;

  if (stock === 0) {
    stockWarning.classList.remove("hidden");
    warningMessage.textContent = "Out of stock!";
    stockElement.classList.remove("text-blue-600", "text-orange-600");
    stockElement.classList.add("text-red-600");
    increaseBtn.disabled = true;
    addToCartBtn.disabled = true;
  } else if (stock <= 5) {
    stockWarning.classList.remove("hidden");
    warningMessage.textContent = `Only ${stock} items left!`;
    stockElement.classList.remove("text-blue-600", "text-red-600");
    stockElement.classList.add("text-orange-600");
    increaseBtn.disabled = false;
  } else {
    stockWarning.classList.add("hidden");
    stockElement.classList.remove("text-red-600", "text-orange-600");
    stockElement.classList.add("text-blue-600");
    increaseBtn.disabled = false;
  }

  if (quantity >= stock) {
    increaseBtn.disabled = true;
  }
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================

async function displayProductDetail() {
  const loadingElement = document.getElementById("loading");
  const mainContent = document.getElementById("main-content");

  const productId = getProductIdFromUrl();
  currentProductId = productId;

  if (!productId) {
    alert("No product UUID provided!");
    window.location.href = "menu-pastry.html";
    return;
  }

  loadingElement.style.display = "flex";
  mainContent.classList.add("hidden");

  const response = await getProductById(productId);

  loadingElement.style.display = "none";

  if (!response || !response.data) {
    alert("Product not found!");
    window.location.href = "menu-pastry.html";
    return;
  }

  const product = response.data;
  currentProduct = product;
  mainContent.classList.remove("hidden");

  document.getElementById("product-name").textContent = product.name;
  document.getElementById("product-description").textContent =
    product.description;
  document.getElementById("product-price").textContent = `$ ${product.price}`;

  productPrice = parseFloat(product.price);

  let stock = getStockFromLocalStorage(productId);
  if (stock === undefined) {
    stock = product.stock !== undefined ? product.stock : 50;
    saveStockToLocalStorage(productId, stock);
  }
  updateStockDisplay(stock);

  const mainImage = document.getElementById("main-image");
  mainImage.src =
    product.thumbnail ||
    product.images ||
    "https://via.placeholder.com/400x300?text=Pastry";
  mainImage.alt = product.name;

  displayThumbnails(product);
  loadSuggestions(productId);
}

function displayThumbnails(product) {
  const thumbnailContainer = document.getElementById("thumbnail-container");
  const mainImage = document.getElementById("main-image");

  const images =
    product.images && Array.isArray(product.images)
      ? product.images
      : [product.thumbnail, product.thumbnail, product.thumbnail];

  thumbnailContainer.innerHTML = "";

  images.slice(0, 3).forEach((imageUrl) => {
    const thumb = document.createElement("div");
    thumb.className =
      "bg-pink-50 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-500 transition";
    thumb.innerHTML = `<img src="${
      imageUrl || product.thumbnail
    }" alt="Thumbnail" class="w-full h-24 object-cover">`;

    thumb.addEventListener("click", () => {
      mainImage.src = imageUrl || product.thumbnail;
    });

    thumbnailContainer.appendChild(thumb);
  });
}

async function loadSuggestions(currentProductId) {
  const suggestionsContainer = document.getElementById("suggestions-container");

  try {
    const categoriesResponse = await fetch(`${baseUrl}categories`, {
      method: "GET",
      headers: { accept: "*/*" },
    });

    if (!categoriesResponse.ok) {
      throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
    }

    const categoriesData = await categoriesResponse.json();
    const categories = Array.isArray(categoriesData)
      ? categoriesData
      : categoriesData.data;

    const drinkCategory = categories.find(
      (cat) => cat.name.toLowerCase() === "drink"
    );

    if (!drinkCategory) {
      suggestionsContainer.innerHTML = cardProduct();
    }

    // if (!drinkCategory) {
    //   suggestionsContainer.innerHTML = '<div class="col-span-4 text-center py-8 text-gray-500">Drink category not found</div>';
    //   return;
    // }

    const response = await fetch(
      `${baseUrl}products/get-by-category/${drinkCategory.uuid}?page=0&size=5`,
      {
        method: "GET",
        headers: { accept: "*/*" },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.data || !data.data.content) {
      suggestionsContainer.innerHTML = cardProduct();
      return;
    }

    const suggestions = data.data.content.slice(0, 4);
    suggestionsContainer.innerHTML = "";

    suggestions.forEach((item) => {
      const itemStock = item.stock !== undefined ? item.stock : 50;
      const stockStatus =
        itemStock === 0
          ? "Out of Stock"
          : itemStock <= 5
          ? `Only ${itemStock} left`
          : `${itemStock} available`;
      const stockColor =
        itemStock === 0
          ? "text-red-600"
          : itemStock <= 5
          ? "text-orange-600"
          : "text-green-600";

      const card = document.createElement("div");
      card.className =
        "bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col";
      card.style.height = "350px";

      card.innerHTML = `
        <div class="relative h-48 overflow-hidden">
          <div class="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-semibold ${stockColor}">
            ${stockStatus}
          </div>
          <img src="${
            item.thumbnail || "https://via.placeholder.com/300x200?text=Drink"
          }" 
               alt="${item.name}" 
               class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 line-clamp-1">
        </div>
        <div class="p-5">
          <h3 class="text-xl font-semibold font-primary text-gray-800 mb-2 line-clamp-1">${
            item.name
          }</h3>
          <p class="text-gray-600 font-primary text-sm mb-4 line-clamp-2">${
            item.description || "Delicious drink"
          }</p>
          <div class="flex items-center justify-between">
            <span class="text-xl font-semibold font-primary text-secondary">$${
              item.price
            }</span>
            <button class="bg-secondary font-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition ${
              itemStock === 0 ? "opacity-50 cursor-not-allowed" : ""
            }" 
                    ${itemStock === 0 ? "disabled" : ""}>
              ${itemStock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
            </button>
          </div>
        </div>
      `;

      if (itemStock > 0) {
        card.addEventListener("click", (e) => {
          if (!e.target.closest("button")) {
            window.location.href = `drink-detail.html?id=${item.uuid}`;
          }
        });
      }

      suggestionsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    suggestionsContainer.innerHTML =
      '<div class="col-span-4 text-center py-8 text-gray-500">No suggestions available</div>';
  }
}

// ============================================================================
// QUANTITY & CART CONTROLS
// ============================================================================

function updateTotalPrice() {
  const totalPriceElement = document.getElementById("total-price");
  const total = (productPrice * quantity).toFixed(2);
  totalPriceElement.textContent = `$ ${total}`;
}

function setupQuantityControls() {
  const quantityDisplay = document.getElementById("quantity");
  const increaseBtn = document.getElementById("increase-btn");
  const decreaseBtn = document.getElementById("decrease-btn");
  const addToCartBtn = document.getElementById("add-to-cart");

  increaseBtn.addEventListener("click", () => {
    if (quantity < currentStock) {
      quantity++;
      quantityDisplay.textContent = quantity;
      updateTotalPrice();
      decreaseBtn.disabled = false;
      addToCartBtn.disabled = false;

      if (quantity >= currentStock) {
        increaseBtn.disabled = true;
      }
    }
  });

  decreaseBtn.addEventListener("click", () => {
    if (quantity > 0) {
      quantity--;
      quantityDisplay.textContent = quantity;
      updateTotalPrice();
      increaseBtn.disabled = false;

      if (quantity === 0) {
        decreaseBtn.disabled = true;
        addToCartBtn.disabled = true;
      }
    }
  });

  decreaseBtn.disabled = true;
  addToCartBtn.disabled = currentStock === 0 || quantity === 0;
}

// ============================================================================
// ADD TO CART - INTEGRATED WITH API
// ============================================================================

async function processOrder(orderQuantity) {
  if (orderQuantity === 0 || orderQuantity > currentStock) {
    return false;
  }

  const newStock = currentStock - orderQuantity;

  await updateStockInAPI(currentProductId, newStock);
  saveStockToLocalStorage(currentProductId, newStock);
  updateStockDisplay(newStock);

  const order = {
    productId: currentProductId,
    quantity: orderQuantity,
    timestamp: new Date().toISOString(),
    totalPrice: (productPrice * orderQuantity).toFixed(2),
  };

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));

  return true;
}

async function addToCartAPI() {
  // Get user from localStorage (saved by login)
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    alert("Please login to add items to cart");
    window.location.href = "./login.html";
    return false;
  }

  const user = JSON.parse(currentUser);
  const userUuid = user.id;

  try {
    const cartItem = {
      userUuid: userUuid,
      productUuid: currentProductId,
      quantity: quantity,
      sugarLevel: "0", // Pastries don't have sugar level
      size: "Regular",
    };

    console.log("Adding to cart:", cartItem);

    const response = await fetch(`${baseUrl}carts`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartItem),
    });

    if (!response.ok) {
      throw new Error("Failed to add to cart");
    }

    const data = await response.json();
    console.log("Added to cart:", data);

    // Update cart badge
    if (window.DynamicNavbar && window.DynamicNavbar.updateCartBadge) {
      window.DynamicNavbar.updateCartBadge();
    }

    return true;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return false;
  }
}

function setupAddToCart() {
  const addToCartBtn = document.getElementById("add-to-cart");
  const productName = document.getElementById("product-name");
  const totalPrice = document.getElementById("total-price");
  const quantityDisplay = document.getElementById("quantity");

  addToCartBtn.addEventListener("click", async () => {
    if (quantity === 0) {
      alert("Please select quantity!");
      return;
    }

    if (quantity > currentStock) {
      alert("Not enough stock available!");
      return;
    }

    addToCartBtn.disabled = true;
    addToCartBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin mr-2"></i> Adding...';

    // Process stock update
    const stockSuccess = await processOrder(quantity);

    // Add to cart API
    const cartSuccess = await addToCartAPI();

    if (stockSuccess && cartSuccess) {
      alert(
        `✅ Added to Cart!\n\n` +
          `Product: ${productName.textContent}\n` +
          `Quantity: ${quantity}\n` +
          `Total: ${totalPrice.textContent}\n\n` +
          `📦 Remaining Stock: ${currentStock} items`
      );

      // Reset
      quantity = 0;
      quantityDisplay.textContent = "0";
      document.getElementById("decrease-btn").disabled = true;
      updateTotalPrice();

      addToCartBtn.innerHTML =
        '<i class="fas fa-shopping-cart mr-2"></i> ADD TO CART';
      addToCartBtn.disabled = currentStock === 0;
    } else {
      alert("Failed to add to cart. Please try again.");
      addToCartBtn.innerHTML =
        '<i class="fas fa-shopping-cart mr-2"></i> ADD TO CART';
      addToCartBtn.disabled = false;
    }
  });
}

// ============================================================================
// REVIEW FUNCTIONS
// ============================================================================

async function fetchReviews(productUuid) {
  try {
    const response = await fetch(`${baseUrl}reviews/products/${productUuid}`, {
      method: "GET",
      headers: { accept: "*/*" },
    });

    if (!response.ok) {
      console.warn("Failed to fetch reviews:", response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

async function displayReviews() {
  const reviewsContainer = document.getElementById("reviews-container");

  if (!reviewsContainer) {
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

  reviewsContainer.innerHTML = reviews
    .map(
      (review) => `
    <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-pink-400 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-white text-lg"></i>
          </div>
          <div>
            <p class="font-semibold text-gray-800">${
              review.createdBy || "Anonymous User"
            }</p>
            <p class="text-sm text-gray-500">${formatDate(review.createdAt)}</p>
          </div>
        </div>
      </div>
      <p class="text-gray-700 leading-relaxed">${review.comment}</p>
    </div>
  `
    )
    .join("");
}

function formatDate(dateString) {
  if (!dateString) return "Recently";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Recently";
  }
}

function setupReviewModal() {
  const reviewBtn = document.getElementById("review-btn");
  const reviewModal = document.getElementById("review-modal");
  const closeModal = document.getElementById("close-modal");
  const cancelReview = document.getElementById("cancel-review");
  const submitReviewBtn = document.getElementById("submit-review");
  const reviewComment = document.getElementById("review-comment");

  if (!reviewBtn || !reviewModal) return;

  reviewBtn.addEventListener("click", () => {
    reviewModal.classList.add("active");
  });

  const closeModalFunc = () => {
    reviewModal.classList.remove("active");
    reviewComment.value = "";
  };

  closeModal.addEventListener("click", closeModalFunc);
  cancelReview.addEventListener("click", closeModalFunc);

  reviewModal.addEventListener("click", (e) => {
    if (e.target === reviewModal) closeModalFunc();
  });

  submitReviewBtn.addEventListener("click", async () => {
    const comment = reviewComment.value.trim();

    if (!comment) {
      alert("Please write a comment!");
      return;
    }

    submitReviewBtn.disabled = true;
    submitReviewBtn.textContent = "Submitting...";

    const result = await submitReview(currentProductId, comment);

    submitReviewBtn.disabled = false;
    submitReviewBtn.textContent = "Submit Review";

    if (result) {
      alert("✅ Review submitted successfully!");
      closeModalFunc();
      await displayReviews();

      const reviewsSection = document.getElementById("reviews-section");
      if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      alert("❌ Failed to submit review. Please try again.");
    }
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener("DOMContentLoaded", () => {
  displayProductDetail();
  setupQuantityControls();
  setupAddToCart();
  setupReviewModal();
  displayReviews();
});
