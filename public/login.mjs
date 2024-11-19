import { db, auth } from './app.mjs';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { checkAuth, redirectToDashboard } from './auth.mjs';

export function displayMessage(message, isError = true) {
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
            let userFound = false;

            for (const userId of Object.keys(users)) {
                const user = users[userId];
                if (user.username === username) {
                    userFound = true;
                    try {
                        await signInWithEmailAndPassword(auth, user.email, password);
                        console.log('Login successful');

                        // Retrieve and store userId using retrieveUserIdByUsername
                        const retrievedUserId = await retrieveUserIdByUsername(username);
                        if (retrievedUserId) {
                            sessionStorage.setItem('userId', retrievedUserId);
                            sessionStorage.setItem('username', username);

                            if (rememberMe) {
                                localStorage.setItem('username', username);
                                localStorage.setItem('rememberMe', 'true');
                            } else {
                                localStorage.removeItem('username');
                                localStorage.removeItem('rememberMe');
                            }

                            displayMessage('Login successful! Redirecting...', false);
                            setTimeout(() => {
                                redirectToDashboard();
                            }, 200);
                        } else {
                            displayMessage('User ID retrieval failed. Please try again.');
                        }
                        return;
                    } catch (authError) {
                        console.error('Firebase Auth Error:', authError);
                        displayMessage('Invalid username or password. Please try again.');
                    }
                    break;
                }
            }

            if (!userFound) {
                displayMessage('Invalid username or password');
            }
        } else {
            displayMessage('No users found. Please sign up.');
            window.location.href = 'signup.html';
        }
    } catch (error) {
        console.error('Login Error:', error);
        displayMessage('An error occurred during login. Please try again.');
    }
}

// Function to retrieve user ID based on username
async function retrieveUserIdByUsername(username) {
    const usersRef = ref(db, 'users');
    try {
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            const matchedUser = Object.entries(users).find(([userId, userData]) => userData.username === username);

            if (matchedUser) {
                const [userId] = matchedUser;
                sessionStorage.setItem('userId', userId);  // Store userId for further use
                console.log('User ID retrieved and stored:', userId);
                return userId;  // Return userId if needed for further processing
            } else {
                console.error('No user data found for the provided username.');
                return null;
            }
        } else {
            console.error('No users found in the database.');
            return null;
        }
    } catch (error) {
        console.error('Error retrieving user ID:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // const loginPage = window.location.pathname.includes('login.html');
        if (!loginPage) { // Only redirect if not on login page
            await checkAuth(); // User is already logged in, redirect to dashboard
            redirectToDashboard();
        }
    } catch (error) {
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
window.togglePasswordVisibility = togglePasswordVisibility;