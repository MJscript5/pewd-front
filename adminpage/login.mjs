// login.mjs

// Function to handle form submission
export function handleLoginFormSubmission(event) {
    event.preventDefault();  // Prevent form from submitting in the default way

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simulated login logic (replace with real validation, API call, etc.)
    if (username === "admin" && password === "admin") {
        // On successful login, redirect to the dashboard
        window.location.href = 'dashboard.html';
    } else {
        // Display error message
        const messageBox = document.querySelector('.login-message');
        messageBox.textContent = 'Invalid username or password';
        messageBox.style.color = 'red';
    }
}

// Function to toggle password visibility
export function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.getElementById('toggle-password-icon');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('bx-hide');
        toggleIcon.classList.add('bx-show');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('bx-show');
        toggleIcon.classList.add('bx-hide');
    }
}
