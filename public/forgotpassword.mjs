import { getAuth, sendPasswordResetEmail } from "auth.mjs";

const auth = getAuth();

function forgotPassword(email) {
    sendPasswordResetEmail(auth, email)
        .then(() => {
            // Password reset email sent!
            console.log('Password reset email sent!');
            // Redirect to a page where user can change their password
            window.location.href = '/change-password';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(`Error: ${errorCode}, ${errorMessage}`);
        });
}

// Example usage
const email = "user@example.com";
forgotPassword(email);