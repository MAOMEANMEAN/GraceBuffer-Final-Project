async function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (!cartCountEl) {
        console.warn('Cart count element not found');
        return;
    }
    
    const userUuid = getCurrentUserUuid();
    if (!userUuid) {
        console.log('No user logged in, setting cart count to 0');
        cartCountEl.textContent = '0';
        return;
    }
    
    try {
        console.log('Updating cart count for user:', userUuid);
        
        // Get cart count from API
        const response = await getUserCart(userUuid);
        
        if (response.success && response.data) {
            const cart = response.data;
            const totalItems = cart.items ? cart.items.length : 0;
            console.log('Cart has', totalItems, 'items');
            cartCountEl.textContent = totalItems;
        } else {
            console.warn('Cart API returned no data');
            cartCountEl.textContent = '0';
        }
    } catch (error) {
        console.error('Error getting cart count:', error);
        // Don't show error to user - just set to 0
        cartCountEl.textContent = '0';
    }
}

// ========== AUTH STATE MANAGEMENT ==========

// Check if user is logged in
function checkAuth(redirectToLogin = true) {
    if (!isLoggedIn()) {
        if (redirectToLogin) {
            alert('Please login first!');
            window.location.href = '../pages/login.html';
        }
        return false;
    }
    return true;
}

// Get current user info
async function getCurrentUser() {
    try {
        const response = await getMe();
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// ========== NAVIGATION HELPERS ==========

// Navigate to page
function navigateTo(url) {
    window.location.href = url;
}

// Go back
function goBack() {
    window.history.back();
}

// ========== IMAGE HANDLING ==========

// Handle image error (show placeholder)
function handleImageError(img) {
    img.src = '../assets/images/placeholder.jpg';
    img.onerror = null;
}

// ========== PRICE CALCULATION ==========

// Calculate tax
function calculateTax(subtotal, taxRate = 0.10) {
    return subtotal * taxRate;
}

// Calculate total with tax
function calculateTotalWithTax(subtotal, taxRate = 0.10) {
    const tax = calculateTax(subtotal, taxRate);
    return subtotal + tax;
}