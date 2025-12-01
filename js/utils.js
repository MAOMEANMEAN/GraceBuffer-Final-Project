function formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ========== LOADING & MESSAGES ==========

// Show loading spinner
function showLoading(elementId = 'loading-spinner') {
    const loader = document.getElementById(elementId);
    if (loader) {
        loader.classList.remove('hidden');
    } else {
        // Create default loading spinner if not exists
        const spinner = document.createElement('div');
        spinner.id = elementId;
        spinner.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        spinner.innerHTML = `
            <div class="bg-white rounded-lg p-6 flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p class="mt-4 text-gray-700">Loading...</p>
            </div>
        `;
        document.body.appendChild(spinner);
    }
}

// Hide loading spinner
function hideLoading(elementId = 'loading-spinner') {
    const loader = document.getElementById(elementId);
    if (loader) {
        loader.classList.add('hidden');
    }
}

// Show error message
function showError(message, duration = 5000) {
    showToast(message, 'error', duration);
}

// Show success message
function showSuccess(message, duration = 3000) {
    showToast(message, 'success', duration);
}

// Show info message
function showInfo(message, duration = 3000) {
    showToast(message, 'info', duration);
}

// Generic toast notification
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in ${
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'success' ? 'bg-green-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    toast.innerHTML = `
        <div class="flex items-center">
            ${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}
            <span class="ml-3">${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('animate-slide-out');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

// ========== URL PARAMETERS ==========

// Get URL parameter
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Set URL parameter
function setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
}

// Remove URL parameter
function removeUrlParameter(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.pushState({}, '', url);
}

// ========== VALIDATION ==========

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone
function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{9,12}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Validate password (min 6 characters)
function isValidPassword(password) {
    return password.length >= 6;
}

// ========== LOCAL STORAGE ALTERNATIVE (Session Storage) ==========

// Note: We use sessionStorage instead of localStorage per project requirements

// Save data to session
function saveToSession(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to session:', error);
        return false;
    }
}

// Get data from session
function getFromSession(key) {
    try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error getting from session:', error);
        return null;
    }
}

// Remove data from session
function removeFromSession(key) {
    try {
        sessionStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from session:', error);
        return false;
    }
}

// Clear all session data
function clearSession() {
    try {
        sessionStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing session:', error);
        return false;
    }
}

// ========== DEBOUNCE & THROTTLE ==========

// Debounce function (for search input)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========== DOM HELPERS ==========

// Safely get element by ID
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

// Safely query selector
function querySelector(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element with selector '${selector}' not found`);
    }
    return element;
}

// ========== ARRAY HELPERS ==========

// Group array by key
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}

// Sort array by key
function sortBy(array, key, ascending = true) {
    return array.sort((a, b) => {
        if (a[key] < b[key]) return ascending ? -1 : 1;
        if (a[key] > b[key]) return ascending ? 1 : -1;
        return 0;
    });
}

// ========== STRING HELPERS ==========

// Truncate text
function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Capitalize first letter
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// ========== NUMBER HELPERS ==========

// Calculate percentage
function calculatePercentage(value, total) {
    return ((value / total) * 100).toFixed(2);
}

// Generate random number
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ========== CONFIRMATION DIALOGS ==========

// Confirm dialog
function confirmDialog(message) {
    return confirm(message);
}

// Custom confirm with callback
function confirmAction(message, onConfirm, onCancel) {
    if (confirm(message)) {
        if (onConfirm) onConfirm();
    } else {
        if (onCancel) onCancel();
    }
}