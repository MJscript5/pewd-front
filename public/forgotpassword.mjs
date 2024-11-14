import { auth } from './app.mjs';
import { sendPasswordResetEmail, confirmPasswordReset } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { redirectToLogin } from './auth.mjs';

async function sendResetEmail(email) {
    try {
        console.log(`Attempting to send password reset email to: ${email}`);
        await sendPasswordResetEmail(auth, email);
        console.log("Password reset email sent successfully!");
        return { success: true, message: "Password reset email sent successfully!" };
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return { success: false, message: error.message };
    }
}

async function handlePasswordChange(oobCode, newPassword) {
    try {
        await confirmPasswordReset(auth, oobCode, newPassword);
        console.log("Password changed successfully!");
        redirectToPreviousPage();
    } catch (error) {
        console.error("Error changing password:", error);
        // Handle error (e.g., show error message to user)
    }
}

// Function to handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const messageElement = document.getElementById('message');

    if (!messageElement) {
        console.error('Message element not found');
        return;
    }

    try {
        const result = await sendResetEmail(email);
        if (result.success) {
            messageElement.textContent = "Password reset link sent. Please check your email.";

            setTimeout(() => {
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
                        emailProviderUrl = null;
                }

                if (emailProviderUrl) {
                    window.open(emailProviderUrl, '_blank');
                }

                const redirectLink = document.createElement('a');
                redirectLink.href = '#';
                redirectLink.textContent = 'Login';
                redirectLink.onclick = (event) => {
                    event.preventDefault();
                    redirectToPreviousPage();
                };

                messageElement.appendChild(document.createElement('br'));
                messageElement.appendChild(redirectLink);
            }, 500);
        } else {
            messageElement.textContent = result.message;
        }
    } catch (error) {
        console.error('Error handling form submission:', error);
        messageElement.textContent = 'An error occurred. Please try again.';
    }
}

function redirectToPreviousPage() {
    const previousPage = document.referrer;
    if (previousPage.includes('index.html')) {
        window.location.href = 'index.html';
    } else {
        window.location.href = 'admin_login.html';
    }
}

// Function to initialize the form
function initForm() {
    const form = document.getElementById('forgot-password-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    } else {
        console.error('Form not found');
    }
}

// Initialize the form when the DOM is loaded
document.addEventListener('DOMContentLoaded', initForm);

export { sendResetEmail, redirectToPreviousPage };