let checkoutCart = null;

// Load checkout page
async function loadCheckoutPage() {
    try {
        showLoading();
        
        // Check if user is logged in
        if (!checkAuth()) {
            return;
        }
        
        // Get cart
        checkoutCart = await getCart();
        
        if (!checkoutCart || !checkoutCart.items || checkoutCart.items.length === 0) {
            // Cart is empty, redirect to menu
            alert('Your cart is empty!');
            window.location.href = '../pages/menu-drink.html';
            return;
        }
        
        // Display order summary
        displayOrderSummary(checkoutCart);
        
        // Calculate and display totals
        updateCheckoutTotals(checkoutCart);
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading checkout:', error);
        hideLoading();
        showError('Failed to load checkout page');
    }
}

// Display order summary
function displayOrderSummary(cart) {
    const summaryContainer = document.getElementById('order-summary');
    if (!summaryContainer) return;
    
    summaryContainer.innerHTML = '';
    
    cart.items.forEach(item => {
        const subtotal = item.price * item.qty;
        
        summaryContainer.innerHTML += `
            <div class="flex items-center justify-between py-3 border-b border-gray-200">
                <div class="flex items-center space-x-3">
                    <img src="${item.image || item.product?.image || '../assets/images/placeholder.jpg'}" 
                         alt="${item.name || item.product?.name}" 
                         class="w-16 h-16 object-cover rounded-lg"
                         onerror="this.src='../assets/images/placeholder.jpg'">
                    <div>
                        <h4 class="font-semibold">${item.name || item.product?.name}</h4>
                        <p class="text-sm text-gray-600">Qty: ${item.qty}</p>
                        ${item.sugarLevel ? `<p class="text-xs text-gray-500">Sugar: ${formatSugarLevel(item.sugarLevel)}</p>` : ''}
                    </div>
                </div>
                <p class="font-semibold">${formatPrice(subtotal)}</p>
            </div>
        `;
    });
}

// Update checkout totals
function updateCheckoutTotals(cart) {
    const subtotal = calculateCartTotal(cart);
    const tax = calculateTax(subtotal, 0.10);
    const shipping = 2.00; // Fixed shipping cost
    const total = subtotal + tax + shipping;
    
    // Update UI
    const subtotalEl = document.getElementById('checkout-subtotal');
    const taxEl = document.getElementById('checkout-tax');
    const shippingEl = document.getElementById('checkout-shipping');
    const totalEl = document.getElementById('checkout-total');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (taxEl) taxEl.textContent = formatPrice(tax);
    if (shippingEl) shippingEl.textContent = formatPrice(shipping);
    if (totalEl) totalEl.textContent = formatPrice(total);
}

// Validate checkout form
function validateCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return false;
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('border-red-500');
            
            // Remove error class on input
            field.addEventListener('input', function() {
                this.classList.remove('border-red-500');
            }, { once: true });
        }
    });
    
    // Validate email
    const emailField = document.getElementById('email');
    if (emailField && !isValidEmail(emailField.value)) {
        isValid = false;
        emailField.classList.add('border-red-500');
        showError('Please enter a valid email address');
    }
    
    // Validate phone
    const phoneField = document.getElementById('phone');
    if (phoneField && !isValidPhone(phoneField.value)) {
        isValid = false;
        phoneField.classList.add('border-red-500');
        showError('Please enter a valid phone number');
    }
    
    if (!isValid) {
        showError('Please fill in all required fields correctly');
    }
    
    return isValid;
}

// Proceed to payment
async function proceedToPayment() {
    // Validate form
    if (!validateCheckoutForm()) {
        return;
    }
    
    try {
        showLoading();
        
        // Get form data
        const customerName = document.getElementById('name')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        const address = document.getElementById('address')?.value || '';
        const notes = document.getElementById('notes')?.value || '';
        
        // Save customer info to session
        const customerInfo = {
            name: customerName,
            email: email,
            phone: phone,
            address: address,
            notes: notes
        };
        
        saveToSession('customer_info', customerInfo);
        
        // Get user UUID and cart UUID
        const userUuid = getCurrentUserUuid();
        const cartUuid = checkoutCart.uuid || checkoutCart.id;
        
        if (!userUuid || !cartUuid) {
            throw new Error('Missing user or cart information');
        }
        
        // Create order via checkout API
        const orderResponse = await checkout(userUuid, cartUuid);
        
        hideLoading();
        
        if (orderResponse.success && orderResponse.data) {
            // Save order ID
            const orderId = orderResponse.data.uuid || orderResponse.data.id;
            saveToSession('order_id', orderId);
            
            // Redirect to payment page
            window.location.href = './payment.html';
        } else {
            showError(orderResponse.message || 'Failed to create order');
        }
        
    } catch (error) {
        hideLoading();
        console.error('Error proceeding to payment:', error);
        showError('Failed to proceed to payment. Please try again.');
    }
}

// Format sugar level
function formatSugarLevel(level) {
    const levels = {
        'no-sugar': 'No Sugar',
        'less-sweet': 'Less Sweet',
        'normal': 'Normal',
        'extra-sweet': 'Extra Sweet'
    };
    return levels[level] || level;
}

// Edit cart
function editCart() {
    window.location.href = './cart.html';
}

// Continue shopping
function continueShopping() {
    window.location.href = './menu-drink.html';
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    loadCheckoutPage();
    updateCartCount();
});