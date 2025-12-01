let paymentOrder = null;
let paymentCustomer = null;

// Load payment page
async function loadPaymentPage() {
    try {
        showLoading();
        
        // Check if user is logged in
        if (!checkAuth()) {
            return;
        }
        
        // Get order ID from session
        const orderId = getFromSession('order_id');
        if (!orderId) {
            alert('No order found. Please complete checkout first.');
            window.location.href = './checkout.html';
            return;
        }
        
        // Get customer info from session
        paymentCustomer = getFromSession('customer_info');
        
        // Get order details
        const userUuid = getCurrentUserUuid();
        const orderResponse = await getOrder(orderId, userUuid);
        
        if (orderResponse.success && orderResponse.data) {
            paymentOrder = orderResponse.data;
            displayOrderSummaryForPayment(paymentOrder);
        } else {
            throw new Error('Failed to load order');
        }
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading payment page:', error);
        hideLoading();
        showError('Failed to load payment page');
    }
}

// Display order summary for payment
function displayOrderSummaryForPayment(order) {
    // Display customer info
    const customerInfoEl = document.getElementById('customer-info');
    if (customerInfoEl && paymentCustomer) {
        customerInfoEl.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold mb-3">Delivery Information</h3>
                <p class="text-sm mb-1"><strong>Name:</strong> ${paymentCustomer.name}</p>
                <p class="text-sm mb-1"><strong>Email:</strong> ${paymentCustomer.email}</p>
                <p class="text-sm mb-1"><strong>Phone:</strong> ${paymentCustomer.phone}</p>
                <p class="text-sm"><strong>Address:</strong> ${paymentCustomer.address}</p>
            </div>
        `;
    }
    
    // Display order items
    const orderItemsEl = document.getElementById('order-items');
    if (orderItemsEl && order.items) {
        orderItemsEl.innerHTML = '';
        order.items.forEach(item => {
            const subtotal = item.price * item.qty;
            orderItemsEl.innerHTML += `
                <div class="flex justify-between py-2 border-b border-gray-200">
                    <div>
                        <p class="font-medium">${item.name || item.product?.name}</p>
                        <p class="text-sm text-gray-600">Qty: ${item.qty}</p>
                    </div>
                    <p class="font-semibold">${formatPrice(subtotal)}</p>
                </div>
            `;
        });
    }
    
    // Display totals
    const subtotal = order.subtotal || calculateCartTotal(order);
    const tax = order.tax || calculateTax(subtotal, 0.10);
    const shipping = order.shipping || 2.00;
    const total = order.total || (subtotal + tax + shipping);
    
    const subtotalEl = document.getElementById('payment-subtotal');
    const taxEl = document.getElementById('payment-tax');
    const shippingEl = document.getElementById('payment-shipping');
    const totalEl = document.getElementById('payment-total');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (taxEl) taxEl.textContent = formatPrice(tax);
    if (shippingEl) shippingEl.textContent = formatPrice(shipping);
    if (totalEl) totalEl.textContent = formatPrice(total);
}

// Select payment method
function selectPaymentMethod(method) {
    // Remove active class from all methods
    const allMethods = document.querySelectorAll('.payment-method');
    allMethods.forEach(el => {
        el.classList.remove('border-primary', 'bg-primary-light');
        el.classList.add('border-gray-300');
    });
    
    // Add active class to selected method
    const selectedMethod = document.getElementById(`payment-${method}`);
    if (selectedMethod) {
        selectedMethod.classList.remove('border-gray-300');
        selectedMethod.classList.add('border-primary', 'bg-primary-light');
    }
    
    // Save selected method
    saveToSession('payment_method', method);
    
    // Show/hide payment details based on method
    showPaymentDetails(method);
}

// Show payment details
function showPaymentDetails(method) {
    // Hide all payment details
    const allDetails = document.querySelectorAll('.payment-details');
    allDetails.forEach(el => el.classList.add('hidden'));
    
    // Show selected payment details
    const detailsEl = document.getElementById(`${method}-details`);
    if (detailsEl) {
        detailsEl.classList.remove('hidden');
    }
}

// Generate QR code for Bakong payment
async function generateBakongQR() {
    try {
        showLoading();
        
        const response = await generateQR();
        
        if (response.success && response.data) {
            const qrContainer = document.getElementById('bakong-qr');
            if (qrContainer) {
                qrContainer.innerHTML = `
                    <div class="text-center">
                        <img src="${response.data.qrCode}" alt="Bakong QR Code" class="mx-auto mb-4">
                        <p class="text-sm text-gray-600">Scan this QR code with your Bakong app</p>
                    </div>
                `;
            }
        }
        
        hideLoading();
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        hideLoading();
        showError('Failed to generate QR code');
    }
}

// Confirm payment
async function confirmPayment() {
    try {
        showLoading();
        
        // Get selected payment method
        const paymentMethod = getFromSession('payment_method');
        if (!paymentMethod) {
            showError('Please select a payment method');
            hideLoading();
            return;
        }
        
        // Prepare payment data
        const paymentData = {
            orderId: paymentOrder.uuid || paymentOrder.id,
            paymentMethod: paymentMethod,
            amount: paymentOrder.total,
            status: 'completed'
        };
        
        // Create payment via API
        const response = await createPayment(paymentData);
        
        hideLoading();
        
        if (response.success) {
            // Clear cart
            const userUuid = getCurrentUserUuid();
            await clearCart(userUuid);
            
            // Clear session data
            removeFromSession('order_id');
            removeFromSession('customer_info');
            removeFromSession('payment_method');
            
            // Show success message
            showSuccess('Payment completed successfully!');
            
            // Redirect to success page or home
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
        } else {
            showError(response.message || 'Payment failed');
        }
        
    } catch (error) {
        console.error('Error confirming payment:', error);
        hideLoading();
        showError('Failed to process payment. Please try again.');
    }
}

// Cancel payment
function cancelPayment() {
    if (confirm('Are you sure you want to cancel this payment?')) {
        window.location.href = './checkout.html';
    }
}

// Initialize payment page
document.addEventListener('DOMContentLoaded', function() {
    loadPaymentPage();
    updateCartCount();
    
    // Select default payment method (cash)
    selectPaymentMethod('cash');
});