// ===============================
// cart-manager.js - Complete Cart Management System
// Place this in /js or /store folder
// ===============================

const API_BASE_URL = "https://gracebuffer-api.srengchipor.dev/api/v1/";

// ===============================
// CART MANAGER CLASS
// ===============================
class CartManager {
    constructor() {
        this.user = this.getUserFromStorage();
        this.cart = [];
        this.init();
    }

    // Get logged-in user
    getUserFromStorage() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }

    // Initialize cart
    async init() {
        if (this.user) {
            // Load cart from localStorage (temporary until API call)
            const savedCart = localStorage.getItem('cart');
            this.cart = savedCart ? JSON.parse(savedCart) : [];
        }
        this.updateCartCount();
    }

    // ===============================
    // ADD TO CART (API CALL)
    // ===============================
    async addToCart(product, options = {}) {
        if (!this.user) {
            alert('Please login to add items to cart!');
            window.location.href = '/pages/login.html';
            return false;
        }

        const cartItem = {
            userUuid: this.user.uuid || this.user.id,
            productUuid: product.uuid,
            sugarLevel: options.sugarLevel || "50%",
            qty: options.quantity || 1,
            // Store additional info for display
            productName: product.name,
            productPrice: product.price,
            productImage: product.thumbnail || product.images
        };

        try {
            // Call API to add to cart
            const response = await fetch(`${API_BASE_URL}carts/add-item-to-cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify(cartItem)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Also save to localStorage for offline access
            this.cart.push(cartItem);
            localStorage.setItem('cart', JSON.stringify(this.cart));
            
            this.updateCartCount();
            this.showNotification(`${product.name} added to cart!`, 'success');
            return true;

        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Failed to add item to cart', 'error');
            return false;
        }
    }

    // ===============================
    // OPEN CART CUSTOMIZATION MODAL
    // ===============================
    openCartModal(product) {
        // Create modal HTML
        const modalHTML = `
            <div id="cart-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-bold text-gray-800">Customize Your Order</h3>
                        <button onclick="window.cartManager.closeCartModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>

                    <!-- Product Info -->
                    <div class="flex gap-4 mb-6 pb-6 border-b">
                        <img src="${product.thumbnail || product.images}" 
                             alt="${product.name}" 
                             class="w-20 h-20 object-cover rounded-lg">
                        <div>
                            <h4 class="font-semibold text-lg">${product.name}</h4>
                            <p class="text-amber-600 font-bold text-xl">$${product.price}</p>
                        </div>
                    </div>

                    <!-- Sugar Level -->
                    <div class="mb-6">
                        <label class="block text-sm font-semibold text-gray-700 mb-3">Sugar Level</label>
                        <div class="grid grid-cols-4 gap-2">
                            ${['0%', '50%', '75%', '100%'].map(level => `
                                <button onclick="window.cartManager.selectSugarLevel('${level}')" 
                                        data-sugar="${level}"
                                        class="sugar-option px-4 py-2 border-2 rounded-lg hover:border-amber-500 transition ${level === '50%' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}">
                                    ${level}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Quantity -->
                    <div class="mb-6">
                        <label class="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
                        <div class="flex items-center gap-4">
                            <button onclick="window.cartManager.updateModalQuantity(-1)" 
                                    class="w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span id="modal-quantity" class="text-2xl font-bold w-12 text-center">1</span>
                            <button onclick="window.cartManager.updateModalQuantity(1)" 
                                    class="w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Total -->
                    <div class="flex justify-between items-center mb-6 pb-6 border-b">
                        <span class="text-lg font-semibold">Total:</span>
                        <span id="modal-total" class="text-2xl font-bold text-amber-600">$${product.price}</span>
                    </div>

                    <!-- Add to Cart Button -->
                    <button onclick="window.cartManager.confirmAddToCart()" 
                            class="w-full bg-amber-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-amber-600 transition">
                        <i class="fas fa-shopping-cart mr-2"></i> ADD TO CART
                    </button>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Store product data
        this.modalProduct = product;
        this.modalOptions = {
            sugarLevel: '50%',
            quantity: 1
        };
    }

    // Select sugar level
    selectSugarLevel(level) {
        this.modalOptions.sugarLevel = level;
        
        // Update UI
        document.querySelectorAll('.sugar-option').forEach(btn => {
            if (btn.dataset.sugar === level) {
                btn.classList.add('border-amber-500', 'bg-amber-50');
                btn.classList.remove('border-gray-200');
            } else {
                btn.classList.remove('border-amber-500', 'bg-amber-50');
                btn.classList.add('border-gray-200');
            }
        });
    }

    // Update quantity in modal
    updateModalQuantity(change) {
        this.modalOptions.quantity = Math.max(1, this.modalOptions.quantity + change);
        document.getElementById('modal-quantity').textContent = this.modalOptions.quantity;
        
        // Update total
        const total = (this.modalProduct.price * this.modalOptions.quantity).toFixed(2);
        document.getElementById('modal-total').textContent = `$${total}`;
    }

    // Confirm and add to cart
    async confirmAddToCart() {
        const success = await this.addToCart(this.modalProduct, this.modalOptions);
        if (success) {
            this.closeCartModal();
        }
    }

    // Close modal
    closeCartModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.remove();
        }
    }

    // ===============================
    // GET CART ITEMS
    // ===============================
    getCartItems() {
        return this.cart;
    }

    // Get cart count
    getCartCount() {
        return this.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    }

    // ===============================
    // UPDATE CART COUNT IN NAVBAR
    // ===============================
    updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const count = this.getCartCount();
            cartCountElement.textContent = count;
            
            if (count > 0) {
                cartCountElement.classList.remove('hidden');
            } else {
                cartCountElement.classList.add('hidden');
            }
        }
    }

    // ===============================
    // REMOVE FROM CART
    // ===============================
    removeFromCart(index) {
        this.cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.showNotification('Item removed from cart', 'success');
    }

    // ===============================
    // CLEAR CART
    // ===============================
    clearCart() {
        this.cart = [];
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    // ===============================
    // SHOW NOTIFICATION
    // ===============================
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        
        notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300`;
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
}

// ===============================
// INITIALIZE GLOBAL CART MANAGER
// ===============================
window.cartManager = new CartManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}
