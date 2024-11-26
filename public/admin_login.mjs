import { db, auth } from './app.mjs';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { checkAuth } from './auth.mjs';

export function displayMessage(message, isError = true) {
    const messageElement = document.querySelector('.login-message');
    messageElement.textContent = message;
    messageElement.style.display = message ? 'block' : 'none';
    messageElement.className = isError ? 'login-message error' : 'login-message success';
}

async function checkLogin(email, password, rememberMe) {
    try {
        

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const adminUid = user.uid;
        sessionStorage.setItem('adminUid', adminUid);
        localStorage.setItem('adminUid', adminUid); 
        console.log('Admin UID stored:', adminUid);
        console.log('Admin login successful');
        sessionStorage.setItem('adminEmail', email);

        if (rememberMe) {
            localStorage.setItem('adminEmail', email);
            localStorage.setItem('adminRememberMe', 'true');
        } else {
            localStorage.removeItem('adminEmail');
            localStorage.removeItem('adminRememberMe');
        }
        displayMessage('Login successful! Redirecting...', false);
        setTimeout(() => {
            window.location.href = 'admin_dashboard.html';
        }, 200);
    } catch (authError) {
        console.error('Firebase Auth Error:', authError);
        if (authError.code === 'auth/invalid-credential') {
            displayMessage('Invalid email or password. Please try again.');
        } else if (authError.code === 'auth/permission-denied') {
            displayMessage('Permission denied. Please contact the administrator.');
        } else {
            displayMessage('An error occurred during login. Please try again.');
        }
    }
}

export function handleLoginFormSubmission(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    if (!email || !password) {
        displayMessage('Please enter both email and password.');
        return;
    }

    checkLogin(email, password, rememberMe);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // const loginPage = window.location.pathname.includes('admin_login.html');
        // console.log('Current page:', window.location.pathname);
        if (!loginPage) { // Only redirect if not on login page
            await checkAuth(); // Admin is already logged in, redirect to dashboard
            console.log('Admin already logged in, redirecting to admin_dashboard.html');
            window.location.href = 'admin_dashboard.html';
        }
    } catch (error) {
        // console.log("Admin not logged in, showing login form");
        
        if (localStorage.getItem('adminRememberMe') === 'true') {
            document.getElementById('email').value = localStorage.getItem('adminEmail') || '';
            document.getElementById('remember-me').checked = true;
        }

        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', handleLoginFormSubmission);
    }
});

export function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("toggle-password-icon");
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.classList.remove("bx-hide");
        toggleIcon.classList.add("bx-show");
    } else {
        passwordInput.type = "password";
        toggleIcon.classList.remove("bx-show");
        toggleIcon.classList.add("bx-hide");
    }
}

// Make togglePasswordVisibility available globally
window.togglePasswordVisibility = togglePasswordVisibility;