// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "YOUR_DATABASE_URL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Handle form submission
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('E-mail').value;
    const password = document.getElementById('password').value;

    try {
        // Sign in using Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Show success message
        document.querySelector('.login-message').textContent = "Login successful!";
        document.querySelector('.login-message').classList.add('success');
        document.querySelector('.login-message').style.display = "block";

        // Redirect to admin dashboard (change URL accordingly)
        window.location.href = "/admin-dashboard.html";
    } catch (error) {
        // Handle errors here
        document.querySelector('.login-message').textContent = "Login failed. Please check your credentials.";
        document.querySelector('.login-message').style.display = "block";
    }
});

// Toggle password visibility
export function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("toggle-password-icon");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.classList.replace('bx-hide', 'bx-show');
    } else {
        passwordInput.type = "password";
        toggleIcon.classList.replace('bx-show', 'bx-hide');
    }
}
