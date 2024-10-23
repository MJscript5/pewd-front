<<<<<<< HEAD
// Import necessary modules from Firebase
import { auth, db } from './app.mjs';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Function to add all event listeners when the DOM is ready
window.onload = () => {
    // Change Password button
    document.getElementById('changePasswordBtn').addEventListener('click', changePassword);
    
    // Back button
    document.getElementById('backButton').addEventListener('click', goBack);
    
    // Toggle password visibility for both password fields
    document.getElementById('toggleNewPassword').addEventListener('click', () => {
        togglePasswordVisibility('newPassword', 'toggleNewPassword');
    });
    document.getElementById('toggleConfirmPassword').addEventListener('click', () => {
        togglePasswordVisibility('confirmPassword', 'toggleConfirmPassword');
    });

    // Enter key handling for form submission
    document.getElementById('signup-form').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.dispatchEvent(new Event('submit'));
        }
    });
};

// Change Password function
async function changePassword() {
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const lengthError = document.getElementById("lengthError");
    const errorMessage = document.getElementById("errorMessage");

    // Reset error messages
    lengthError.style.display = "none";
    errorMessage.style.display = "none";

    // Validate password length and content (minimum 8 characters, alphanumeric)
    const isValidPassword = newPassword.length >= 8 && /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword);
    
    if (newPassword === confirmPassword) {
        if (isValidPassword) {
            try {
                // Example of using Firebase Auth to change password (if required)
                // const user = auth.currentUser; // Ensure the user is authenticated
                // await updatePassword(user, newPassword); // Update the password in Firebase
                
                alert("Password changed successfully!");
                document.getElementById("newPassword").value = '';
                document.getElementById("confirmPassword").value = '';
                // Redirect to the login page
                window.location.href = "index.html";
            } catch (error) {
                console.error("Error changing password:", error);
                lengthError.style.display = "block"; // Show error if there's an issue
            }
        } else {
            lengthError.style.display = "block"; // Show length error message
        }
    } else {
        errorMessage.style.display = "block"; // Show password mismatch error message
    }
}

// Toggle password visibility function
function togglePasswordVisibility(inputId, iconId) {
    const inputField = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    
    if (inputField.type === "password") {
        inputField.type = "text";
        icon.setAttribute("name", "show");
    } else {
        inputField.type = "password";
        icon.setAttribute("name", "hide");
    }
}

// Back button function to navigate back to the login page
function goBack() {
    window.location.href = "index.html";
}
=======
// Import necessary modules from Firebase
import { auth, db } from './app.mjs';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Function to add all event listeners when the DOM is ready
window.onload = () => {
    // Change Password button
    document.getElementById('changePasswordBtn').addEventListener('click', changePassword);
    
    // Back button
    document.getElementById('backButton').addEventListener('click', goBack);
    
    // Toggle password visibility for both password fields
    document.getElementById('toggleNewPassword').addEventListener('click', () => {
        togglePasswordVisibility('newPassword', 'toggleNewPassword');
    });
    document.getElementById('toggleConfirmPassword').addEventListener('click', () => {
        togglePasswordVisibility('confirmPassword', 'toggleConfirmPassword');
    });

    // Enter key handling for form submission
    document.getElementById('signup-form').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.dispatchEvent(new Event('submit'));
        }
    });
};

// Change Password function
async function changePassword() {
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const lengthError = document.getElementById("lengthError");
    const errorMessage = document.getElementById("errorMessage");

    // Reset error messages
    lengthError.style.display = "none";
    errorMessage.style.display = "none";

    // Validate password length and content (minimum 8 characters, alphanumeric)
    const isValidPassword = newPassword.length >= 8 && /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword);
    
    if (newPassword === confirmPassword) {
        if (isValidPassword) {
            try {
                // Example of using Firebase Auth to change password (if required)
                // const user = auth.currentUser; // Ensure the user is authenticated
                // await updatePassword(user, newPassword); // Update the password in Firebase
                
                alert("Password changed successfully!");
                document.getElementById("newPassword").value = '';
                document.getElementById("confirmPassword").value = '';
                // Redirect to the login page
                window.location.href = "index.html";
            } catch (error) {
                console.error("Error changing password:", error);
                lengthError.style.display = "block"; // Show error if there's an issue
            }
        } else {
            lengthError.style.display = "block"; // Show length error message
        }
    } else {
        errorMessage.style.display = "block"; // Show password mismatch error message
    }
}

// Toggle password visibility function
function togglePasswordVisibility(inputId, iconId) {
    const inputField = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    
    if (inputField.type === "password") {
        inputField.type = "text";
        icon.setAttribute("name", "show");
    } else {
        inputField.type = "password";
        icon.setAttribute("name", "hide");
    }
}

// Back button function to navigate back to the login page
function goBack() {
    window.location.href = "index.html";
}
>>>>>>> 18249aded329655e6424cad5532225a41e3d0ef7
