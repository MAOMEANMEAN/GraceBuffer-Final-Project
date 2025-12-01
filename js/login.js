import { login, getCurrentUser } from '../store/auth-manager.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            // Show loading
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
            
            // Attempt login
            const result = await login(email, password);
            
            if (result.success) {
                alert('Login successful!');
                window.location.href = '../index.html';
            } else {
                alert('Login failed: ' + result.message);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Log in to your account';
            }
        });
    }
});