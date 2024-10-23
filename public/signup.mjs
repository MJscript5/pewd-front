<<<<<<< HEAD
import { auth, db } from './app.mjs';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
document.getElementById('signup-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  if (isSubmitting) return;  // Prevent multiple submissions
  isSubmitting = true;  // Set the flag to indicate submission is happening

  clearMessages();

  if (!checkFormCompletion()) {
    displayError('Please fill out all required fields.');
    isSubmitting = false;  // Allow resubmission
    return;
  }

  const username = document.querySelector('input[name="username"]').value.trim();
  const email = document.querySelector('input[name="email"]').value.trim();
  const phoneNumber = document.querySelector('input[name="number"]').value.trim();
  const password = document.querySelector('input[name="password"]').value;
  const confirmPassword = document.querySelector('input[name="confirm_password"]').value;
  const birthday = document.querySelector('input[name="birthday"]').value;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    displayError('Please enter a valid email address.');
    isSubmitting = false;  // Allow resubmission
    return;
  }

  const phonePattern = /^09\d{9}$/;
  if (!phonePattern.test(phoneNumber)) {
    displayError('Phone number must be 11 digits and start with "09".');
    isSubmitting = false;  // Allow resubmission
    return;
  }

  if (password.length < 8) {
    displayError('Password must be at least 8 characters long.');
    isSubmitting = false;  // Allow resubmission
    return;
  }

  if (password !== confirmPassword) {
    displayError('Passwords do not match.');
    isSubmitting = false;  // Allow resubmission
    return;
  }

  try {
    const existingField = await checkExistingUser(username, email, phoneNumber);
    if (existingField) {
      displayError(`${existingField} already exists. Please choose a different one or log in.`);
      isSubmitting = false;  // Allow resubmission
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

    const successMessage = document.getElementById('success-message');
    successMessage.textContent = 'Sign-up successful! Redirecting to sign-in page...';
    successMessage.style.display = 'block';
    successMessage.setAttribute('role', 'alert');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  } catch (error) {
    displayError(error.message);
    isSubmitting = false;  // Allow resubmission in case of error
  }
});

// Enter key handling for form submission
document.getElementById('signup-form').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    this.dispatchEvent(new Event('submit'));
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
=======
import { auth, db } from './app.mjs';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
document.getElementById('signup-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  if (isSubmitting) return;  // Prevent multiple submissions
  isSubmitting = true;  // Set the flag to indicate submission is happening

  clearMessages();

  if (!checkFormCompletion()) {
    displayError('Please fill out all required fields.');
    isSubmitting = false;  // Allow resubmission
    return;
  }

  const username = document.querySelector('input[name="username"]').value.trim();
  const email = document.querySelector('input[name="email"]').value.trim();
  const phoneNumber = document.querySelector('input[name="number"]').value.trim();
  const password = document.querySelector('input[name="password"]').value;
  const confirmPassword = document.querySelector('input[name="confirm_password"]').value;
  const birthday = document.querySelector('input[name="birthday"]').value;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    displayError('Please enter a valid email address.');
    isSubmitting = false;  // Allow resubmission
    return;
  }

  const phonePattern = /^09\d{9}$/;
  if (!phonePattern.test(phoneNumber)) {
    displayError('Phone number must be 11 digits and start with "09".');
    isSubmitting = false;  // Allow resubmission
    return;
  }

  if (password.length < 8) {
    displayError('Password must be at least 8 characters long.');
    isSubmitting = false;  // Allow resubmission
    return;
  }

  if (password !== confirmPassword) {
    displayError('Passwords do not match.');
    isSubmitting = false;  // Allow resubmission
    return;
  }

  try {
    const existingField = await checkExistingUser(username, email, phoneNumber);
    if (existingField) {
      displayError(`${existingField} already exists. Please choose a different one or log in.`);
      isSubmitting = false;  // Allow resubmission
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

    const successMessage = document.getElementById('success-message');
    successMessage.textContent = 'Sign-up successful! Redirecting to sign-in page...';
    successMessage.style.display = 'block';
    successMessage.setAttribute('role', 'alert');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  } catch (error) {
    displayError(error.message);
    isSubmitting = false;  // Allow resubmission in case of error
  }
});

// Enter key handling for form submission
document.getElementById('signup-form').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    this.dispatchEvent(new Event('submit'));
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
>>>>>>> 18249aded329655e6424cad5532225a41e3d0ef7
