class DynamicNavbar {
  constructor() {
    this.user = this.getUserFromStorage();
    this.init();
  }

  // Get user data from localStorage
  getUserFromStorage() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  // Save user to localStorage
  static saveUser(userData) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }

  // Logout user
  static logout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
  }

  // Get initials from name (A-Z)
  getInitials(name) {
    if (!name) return '?';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  // Generate navbar HTML
  generateNavbarHTML() {
    const isLoggedIn = this.user !== null;
    
    return `
      <nav class="bg-primary px-4 sm:px-6 py-3 shadow-md">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <!-- Logo -->
          <a href="/index.html" class="flex-shrink-0">
            <img src="/assets/images/logo-grace-buffer.png" alt="Grace Buffer Logo" class="w-10 h-10 sm:w-12 sm:h-12 object-contain cursor-pointer hover:scale-110 transition-transform" />
          </a>
          
          <!-- Desktop Navigation Links -->
          <div class="hidden md:flex items-center space-x-6 lg:space-x-8 ">
            <a href="/index.html" class="text-black font-medium hover:text-amber-700 transition">Home</a>
            <a href="/pages/menu.html" class="text-black font-medium hover:text-amber-700 transition">Menu</a>
            <a href="/pages/about.html" class="text-black font-medium hover:text-amber-700 transition">About us</a>
          </div>
          
          <!-- Right Side Actions -->
          <div class="flex items-center space-x-2 sm:space-x-4">
            <!-- Dark Mode Toggle -->
            <button id="theme-toggle" type="button" class="p-2 hover:bg-amber-400 rounded-full transition" aria-label="Toggle dark mode">
              <!-- Sun Icon (shown in dark mode) -->
              <svg id="theme-toggle-light-icon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
              </svg>
              
              <!-- Moon Icon (shown in light mode) -->
              <svg id="theme-toggle-dark-icon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            </button>
            
            <!-- Shopping Cart -->
            <a href="/pages/cart.html" class="p-2 hover:bg-amber-400 rounded-full transition relative">
              <i class="fas fa-shopping-cart text-lg"></i>
              <span id="cart-count" class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">0</span>
            </a>
            
            ${isLoggedIn ? this.generateUserMenu() : this.generateLoginButton()}
            
            <!-- Mobile Menu Button -->
            <button id="mobile-menu-btn" class="md:hidden p-2 hover:bg-amber-400 rounded-full transition">
              <i class="fas fa-bars text-lg"></i>
            </button>
          </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden mt-4 pb-4 space-y-2">
          <a href="/index.html" class="block px-4 py-2 text-black hover:bg-amber-400 rounded-lg transition">Home</a>
          <a href="/pages/menu.html" class="block px-4 py-2 text-black hover:bg-amber-400 rounded-lg transition">Menu</a>
          <a href="/pages/about.html" class="block px-4 py-2 text-black hover:bg-amber-400 rounded-lg transition">About us</a>
        </div>
      </nav>
    `;
  }

  // Generate login button (when not logged in)
  generateLoginButton() {
    return `
      <a href="/pages/login.html" class="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition font-medium text-sm sm:text-base">
        Login
      </a>
    `;
  }

  // Generate user menu (when logged in)
  generateUserMenu() {
    const initials = this.getInitials(this.user.firstName || this.user.name);
    const fullName = this.user.firstName 
      ? `${this.user.firstName} ${this.user.lastName || ''}`.trim() 
      : this.user.name || 'User';

    return `
      <div class="relative">
        <!-- User Avatar Button -->
        <button id="user-menu-button" class="flex items-center gap-1 sm:gap-2 hover:bg-amber-400 rounded-full transition p-1 pr-2 sm:pr-3">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-amber-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md">
            ${initials}
          </div>
          <span class="hidden sm:block text-gray-800 font-medium text-sm">${fullName.split(' ')[0]}</span>
          <i class="fas fa-chevron-down text-xs text-gray-600"></i>
        </button>
        
        <!-- Dropdown Menu -->
        <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
          <div class="px-4 py-3 border-b border-gray-100">
            <p class="text-sm text-gray-500">Signed in as</p>
            <p class="text-sm font-semibold text-gray-800 truncate">${fullName}</p>
            ${this.user.email ? `<p class="text-xs text-gray-500 truncate">${this.user.email}</p>` : ''}
          </div>
          
          <div class="border-t border-gray-100 mt-2 pt-2">
            <button id="logout-button" class="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition">
              <i class="fas fa-sign-out-alt mr-3"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Setup event listeners
  setupEventListeners() {
    // User menu dropdown toggle
    const userMenuButton = document.getElementById('user-menu-button');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenuButton && userDropdown) {
      userMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.add('hidden');
        }
      });
    }

    // Logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
          DynamicNavbar.logout();
        }
      });
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    // Theme toggle with dark mode
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Initialize theme on load
    this.initializeTheme();
  }

  // Initialize theme
  initializeTheme() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('color-theme');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    
    if (!themeToggleDarkIcon || !themeToggleLightIcon) return;

    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      // Dark mode
      document.documentElement.classList.add('dark');
      themeToggleLightIcon.classList.remove('hidden');
      themeToggleDarkIcon.classList.add('hidden');
    } else {
      // Light mode
      document.documentElement.classList.remove('dark');
      themeToggleDarkIcon.classList.remove('hidden');
      themeToggleLightIcon.classList.add('hidden');
    }
  }

  // Toggle theme
  toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    
    if (isDark) {
      // Switch to light mode
      document.documentElement.classList.remove('dark');
      localStorage.setItem('color-theme', 'light');
      themeToggleDarkIcon.classList.remove('hidden');
      themeToggleLightIcon.classList.add('hidden');
    } else {
      // Switch to dark mode
      document.documentElement.classList.add('dark');
      localStorage.setItem('color-theme', 'dark');
      themeToggleLightIcon.classList.remove('hidden');
      themeToggleDarkIcon.classList.add('hidden');
    }
  }

  // Initialize navbar
  init() {
    // Create header element if it doesn't exist
    let header = document.querySelector('header');
    if (!header) {
      header = document.createElement('header');
      document.body.insertBefore(header, document.body.firstChild);
    }

    // Inject navbar HTML
    header.innerHTML = this.generateNavbarHTML();

    // Setup event listeners
    this.setupEventListeners();

    // Update cart count
    this.updateCartCount();
  }

  // Update cart count
  updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || item.qty || 1), 0);
      
      if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.classList.remove('hidden');
      } else {
        cartCount.classList.add('hidden');
      }
    }
  }
}

// Auto-initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DynamicNavbar();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DynamicNavbar;
}