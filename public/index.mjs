<<<<<<< HEAD
import { db, auth } from './app.mjs';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { checkAuth } from './auth.mjs';

function displayMessage(message, isError = true) {
    const messageElement = document.querySelector('.login-message');
    messageElement.textContent = message;
    messageElement.style.display = message ? 'block' : 'none';
    messageElement.className = isError ? 'login-message error' : 'login-message success';
}

async function checkLogin(username, password, rememberMe) {
    const usersRef = ref(db, 'users');

    try {
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            const userIds = Object.keys(users);
            let userFound = false;

            for (const userId of userIds) {
                const user = users[userId];
                if (user.username === username) {
                    userFound = true;
                    try {
                        // Attempt to sign in with Firebase Authentication
                        await signInWithEmailAndPassword(auth, user.email, password);
                        console.log('Login successful');
                        if (rememberMe) {
                            localStorage.setItem('username', username);
                            localStorage.setItem('rememberMe', 'true');
                        } else {
                            localStorage.removeItem('username');
                            localStorage.removeItem('rememberMe');
                        }
                        displayMessage('Login successful! Redirecting...', false);
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 200);
                        return;
                    } catch (authError) {
                        console.error('Firebase Auth Error:', authError);
                        if (authError.code === 'auth/invalid-credential') {
                            displayMessage('Invalid username or password. Please try again.');
                        } else {
                            displayMessage('An error occurred during login. Please try again.');
                        }
                    }
                    break; // Exit loop after finding matching username
                }
            }

            if (!userFound) {
                displayMessage('Invalid username or password');
            }
        } else {
            displayMessage('No users found. Please sign up.');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        displayMessage('Error connecting to the database. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await checkAuth();
        // User is already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        // User is not logged in, show login form
        console.log("User not logged in, showing login form");
        
        if (localStorage.getItem('rememberMe') === 'true') {
            document.getElementById('username').value = localStorage.getItem('username') || '';
            document.getElementById('remember-me').checked = true;
        }

        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;

            if (!username || !password) {
                displayMessage('Please enter both username and password.');
                return;
            }

            await checkLogin(username, password, rememberMe);
        });
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
=======
import { db, auth } from './app.mjs';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { checkAuth } from './auth.mjs';

function displayMessage(message, isError = true) {
    const messageElement = document.querySelector('.login-message');
    messageElement.textContent = message;
    messageElement.style.display = message ? 'block' : 'none';
    messageElement.className = isError ? 'login-message error' : 'login-message success';
}

async function checkLogin(username, password, rememberMe) {
    const usersRef = ref(db, 'users');

    try {
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            const userIds = Object.keys(users);
            let userFound = false;

            for (const userId of userIds) {
                const user = users[userId];
                if (user.username === username) {
                    userFound = true;
                    try {
                        // Attempt to sign in with Firebase Authentication
                        await signInWithEmailAndPassword(auth, user.email, password);
                        console.log('Login successful');
                        if (rememberMe) {
                            localStorage.setItem('username', username);
                            localStorage.setItem('rememberMe', 'true');
                        } else {
                            localStorage.removeItem('username');
                            localStorage.removeItem('rememberMe');
                        }
                        displayMessage('Login successful! Redirecting...', false);
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 200);
                        return;
                    } catch (authError) {
                        console.error('Firebase Auth Error:', authError);
                        if (authError.code === 'auth/invalid-credential') {
                            displayMessage('Invalid username or password. Please try again.');
                        } else {
                            displayMessage('An error occurred during login. Please try again.');
                        }
                    }
                    break; // Exit loop after finding matching username
                }
            }

            if (!userFound) {
                displayMessage('Invalid username or password');
            }
        } else {
            displayMessage('No users found. Please sign up.');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        displayMessage('Error connecting to the database. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await checkAuth();
        // User is already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        // User is not logged in, show login form
        console.log("User not logged in, showing login form");
        
        if (localStorage.getItem('rememberMe') === 'true') {
            document.getElementById('username').value = localStorage.getItem('username') || '';
            document.getElementById('remember-me').checked = true;
        }

        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;

            if (!username || !password) {
                displayMessage('Please enter both username and password.');
                return;
            }

            await checkLogin(username, password, rememberMe);
        });
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
>>>>>>> 18249aded329655e6424cad5532225a41e3d0ef7
window.togglePasswordVisibility = togglePasswordVisibility;