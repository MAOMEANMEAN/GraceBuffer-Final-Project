// API Configuration
const baseUrl = "https://gracebuffer-api.srengchipor.dev/api/v1/";
const categoryUuid = "58f9363b-e643-4381-a873-96d5fc4e6e28";

// Variables to track state
let pastryData = []; // Will be populated from API
let visiblePastries = 8; // Initially show only 2 rows (4 cards per row × 2 rows = 8 cards)
const pastriesPerLoad = 8; // Load 2 more rows when clicking "See More"

// DOM elements
const pastriesContainer = document.getElementById("pastries-container");
const seeMoreBtn = document.getElementById("see-more-btn");
const loadingElement = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");

// Function to fetch pastries from API
async function fetchPastries() {
  try {
    loadingElement.style.display = "block";
    errorMessage.classList.add("hidden");

    const response = await fetch(`${baseUrl}products/category/${categoryUuid}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.payload && Array.isArray(data.payload)) {
      pastryData = data.payload;
      renderPastries();
    } else {
      throw new Error("Invalid data format received from API");
    }
  } catch (error) {
    console.error("Error fetching pastries:", error);
    showError("Failed to load pastries. Please try again later.");
  } finally {
    loadingElement.style.display = "none";
  }
}

// Function to show error message
function showError(message) {
  errorText.textContent = message;
  errorMessage.classList.remove("hidden");
}

// Function to render pastries
function renderPastries() {
  // Clear container
  pastriesContainer.innerHTML = "";

  if (pastryData.length === 0) {
    showError("No pastries available at the moment.");
    return;
  }

  // Create all pastry cards but hide the ones beyond initial count
  pastryData.forEach((pastry, index) => {
    const pastryCard = document.createElement("div");
    pastryCard.className = `pastry-card bg-white rounded-lg shadow-md overflow-hidden`;

    // Add hidden class to cards beyond the initial visible count
    if (index >= visiblePastries) {
      pastryCard.classList.add("hidden-pastries");
    }

    // Use placeholder image if no image is available
    const imageUrl = pastry.imageUrl || "../assets/pastry 2/1.jpg";
    const price = pastry.price
      ? `$${pastry.price.toFixed(2)}`
      : "Price not available";
    const description = pastry.description || "Delicious pastry";

    pastryCard.innerHTML = `
                    <img src="${imageUrl}" alt="${pastry.name}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h3 class="text-xl font-semibold font-primary text-gray-900 mb-2">${pastry.name}</h3>
                        <p class="text-gray-600 mb-4">${description}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-lg font-bold font-primary text-secondary">${price}</span>
                            <button class="bg-secondary font-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                `;

    pastriesContainer.appendChild(pastryCard);
  });

  // Show or hide "See More" button based on whether there are more pastries to show
  if (visiblePastries >= pastryData.length) {
    seeMoreBtn.classList.add("hidden");
  } else {
    seeMoreBtn.classList.remove("hidden");
  }
}

// Function to load more pastries
function loadMorePastries() {
  // Increase the visible count
  visiblePastries += pastriesPerLoad;

  // Show the hidden cards
  const hiddenCards = document.querySelectorAll(".hidden-pastries");
  const cardsToShow = Math.min(hiddenCards.length, pastriesPerLoad);

  for (let i = 0; i < cardsToShow; i++) {
    hiddenCards[i].classList.remove("hidden-pastries");
  }

  // Update button visibility
  if (visiblePastries >= pastryData.length) {
    seeMoreBtn.classList.add("hidden");
  }

  // Smooth scroll to show the newly loaded items
  if (visiblePastries > pastriesPerLoad) {
    seeMoreBtn.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Event listener for "See More" button
seeMoreBtn.addEventListener("click", loadMorePastries);

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  fetchPastries();
});

// Mobile menu toggle function
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  const menuIcon = document.getElementById("menuIcon");

  if (mobileMenu.classList.contains("hidden")) {
    mobileMenu.classList.remove("hidden");
    menuIcon.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
  } else {
    mobileMenu.classList.add("hidden");
    menuIcon.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
  }
}

// Theme toggle function
function toggleTheme() {
  const html = document.documentElement;
  const themeIcon = document.getElementById("themeIcon");

  if (html.classList.contains("dark")) {
    html.classList.remove("dark");
    themeIcon.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
  } else {
    html.classList.add("dark");
    themeIcon.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
  }
}
