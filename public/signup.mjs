import { auth, db } from './app.mjs';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { redirectToLogin } from './auth.mjs';

let isSubmitting = false;  // To prevent multiple submissions

// Check if all required fields are completed
function checkFormCompletion() {
  const inputs = document.querySelectorAll('input[required]');
  return Array.from(inputs).every(input => input.value.trim() !== '');
}

// Display error messages
function displayError(message) {
  const errorMessage = document.getElementById('error-message');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  errorMessage.setAttribute('role', 'alert');
}

// Clear messages
function clearMessages() {
  const messages = ['notification-message', 'error-message', 'success-message'];
  messages.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none';
      element.textContent = '';
    }
  });
}

// Check if the user already exists
async function checkExistingUser(username, email, phoneNumber) {
  const usersRef = ref(db, 'users');
  try {
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      for (let userId in users) {
        const user = users[userId];
        if (user.username === username) return 'Username';
        if (user.email === email) return 'Email';
        if (user.phoneNumber === phoneNumber) return 'Phone number';
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking existing user:', error);
    throw new Error('Error checking user data. Please try again later.');
  }
}

// Create a new user in the database
async function createUserInDatabase(userId, userData) {
  try {
    await set(ref(db, 'users/' + userId), userData);
    return true;
  } catch (error) {
    console.error('Error creating new user:', error);
    throw new Error('Error creating user. Please try again.');
  }
}

// Handle form submission
document.getElementById('signup-form').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission

  // Check if all required fields are filled
  if (!checkFormCompletion()) {
    displayError('Please fill in all required fields.');
    return;
  }

  // Check if a submission is already in progress
  if (isSubmitting) {
    return;
  }

  isSubmitting = true; // Set the flag to prevent further submissions
  clearMessages(); // Clear previous messages

  // Get form values
  const username = event.target.username.value;
  const email = event.target.email.value;
  const phoneNumber = event.target.number.value;
  const password = event.target.password.value;
  const confirmPassword = event.target.confirm_password.value;
  const birthday = event.target.birthday.value;

  try {
    // Disable submit button to prevent duplicate clicks
    event.target.querySelector('input[type="submit"]').disabled = true;

    // Check if the user already exists
    const existingField = await checkExistingUser(username, email, phoneNumber);
    if (existingField) {
      displayError(`User with this ${existingField} already exists.`);
      isSubmitting = false; // Allow resubmission
      event.target.querySelector('input[type="submit"]').disabled = false; // Re-enable submit button
      return;
    }

    // Validate passwords
    if (password !== confirmPassword) {
      displayError('Passwords do not match. Please try again.');
      isSubmitting = false;  // Allow resubmission
      event.target.querySelector('input[type="submit"]').disabled = false; // Re-enable submit button
      return;
    }

    if (!isValidPassword(password)) {
      displayError('Password is invalid. Please ensure it meets the required criteria.');
      isSubmitting = false;  // Allow resubmission
      event.target.querySelector('input[type="submit"]').disabled = false; // Re-enable submit button
      return;
    }

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Generate user ID using timestamp
    const userId = new Date().getTime();

    // Store additional user data in Firebase Realtime Database
    const userData = {
      username,
      email,
      phoneNumber,
      birthday
    };

    await createUserInDatabase(userId, userData);

    // Send email verification
    await sendEmailVerification(user);

    // Show success message
    const successMessage = document.getElementById('success-message');
    successMessage.textContent = 'Sign-up successful! Redirecting...';
    successMessage.style.display = 'block';
    successMessage.setAttribute('role', 'alert');

    // Redirect to email provider and login page
    setTimeout(() => {
      openEmailProvider(email);
      setTimeout(() => {
        redirectToLogin();
      }, 3000); // Redirect delay
    }, 1000);

    // Clear credentials from local storage
    localStorage.clear();

  } catch (error) {
    console.error('Sign-up error:', error.message); // Logs a concise error message
    if (error.code === 'auth/email-already-in-use') {
      displayError('User with this email already exists.');
    } else if (error.code === 'auth/invalid-email') {
      displayError('Invalid email address.');
    } else if (error.code === 'auth/weak-password') {
      displayError('Password is too weak.');
    } else {
      displayError('An error occurred during sign-up. Please try again.');
    }
    isSubmitting = false;  // Allow resubmission
    event.target.querySelector('input[type="submit"]').disabled = false; // Re-enable submit button
  }
});

// Function to open email provider
function openEmailProvider(email) {
  const emailDomain = email.split('@')[1];
  let emailProviderUrl;

  switch (emailDomain) {
    case 'gmail.com':
      emailProviderUrl = 'https://mail.google.com/';
      break;
    case 'yahoo.com':
      emailProviderUrl = 'https://mail.yahoo.com/';
      break;
    case 'outlook.com':
      emailProviderUrl = 'https://outlook.live.com/';
      break;
    default:
      emailProviderUrl = `https://mail.${emailDomain}/`;
  }

  if (emailProviderUrl) {
    window.open(emailProviderUrl, '_blank');
  }
}

// Enter key handling for form submission
document.getElementById('signup-form').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    this.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
});

// Password visibility toggle functions
export function togglePasswordVisibility() {
  const passwordInput = document.querySelector('input[name="password"]');
  const toggleIcon = document.getElementById('toggle-password-icon');
  togglePasswordVisibilityHelper(passwordInput, toggleIcon);
}

export function toggleConfirmPasswordVisibility() {
  const confirmPasswordInput = document.getElementById('confirm_password');
  const toggleIcon = document.getElementById('toggle-confirm-password-icon');
  togglePasswordVisibilityHelper(confirmPasswordInput, toggleIcon);
}

// Helper function for toggling password visibility
function togglePasswordVisibilityHelper(inputElement, toggleIcon) {
  if (inputElement.type === 'password') {
    inputElement.type = 'text';
    toggleIcon.classList.remove('bx-hide');
    toggleIcon.classList.add('bx-show');
  } else {
    inputElement.type = 'password';
    toggleIcon.classList.remove('bx-show');
    toggleIcon.classList.add('bx-hide');
  }
}

// Helper function to validate password
function isValidPassword(password) {
  return password.length >= 8; 
}
