// spaghetti.js - Complete with Dark/Light Mode Toggle

// Mobile menu functionality
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const menuOpenIcon = document.getElementById('menu-open');
const menuCloseIcon = document.getElementById('menu-close');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('max-h-0');

        if (isOpen) {
            mobileMenu.classList.remove('max-h-0', 'opacity-0');
            mobileMenu.classList.add('max-h-96', 'opacity-100');
            menuOpenIcon.classList.add('hidden');
            menuCloseIcon.classList.remove('hidden');
        } else {
            mobileMenu.classList.remove('max-h-96', 'opacity-100');
            mobileMenu.classList.add('max-h-0', 'opacity-0');
            menuOpenIcon.classList.remove('hidden');
            menuCloseIcon.classList.add('hidden');
        }
    });
}

// Dark/Light mode toggle functionality
const themeToggleBtns = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
const themeToggleDarkIcons = document.querySelectorAll('#theme-toggle-dark-icon, #theme-toggle-dark-icon-mobile');
const themeToggleLightIcons = document.querySelectorAll('#theme-toggle-light-icon, #theme-toggle-light-icon-mobile');

// Function to apply theme
function applyTheme(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark');
        themeToggleLightIcons.forEach(icon => icon.classList.remove('hidden'));
        themeToggleDarkIcons.forEach(icon => icon.classList.add('hidden'));
    } else {
        document.documentElement.classList.remove('dark');
        themeToggleDarkIcons.forEach(icon => icon.classList.remove('hidden'));
        themeToggleLightIcons.forEach(icon => icon.classList.add('hidden'));
    }
}

// Check for saved theme preference or respect OS preference
function initializeTheme() {
    const savedTheme = localStorage.getItem('color-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        applyTheme(true);
    } else {
        applyTheme(false);
    }
}

// Toggle theme function
function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
        applyTheme(false);
        localStorage.setItem('color-theme', 'light');
    } else {
        applyTheme(true);
        localStorage.setItem('color-theme', 'dark');
    }
}

// Add event listeners to both toggle buttons
themeToggleBtns.forEach(btn => {
    if (btn) {
        btn.addEventListener('click', toggleTheme);
    }
});

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', initializeTheme);

// Re-initialize theme icons when navbar loads (in case navbar loads after DOMContentLoaded)
setTimeout(initializeTheme, 100);

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('color-theme')) {
        applyTheme(e.matches);
    }
});