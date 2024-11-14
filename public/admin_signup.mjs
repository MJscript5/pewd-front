import { db } from './app.mjs';
import { signUpUser } from './auth.mjs';
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.getElementById("signup-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullName = document.getElementById("signup-fullName").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirmPassword").value;
    const jobTitle = document.getElementById("signup-jobTitle").value === "Others" ? document.getElementById("signup-otherJobTitle").value : document.getElementById("signup-jobTitle").value;
    const errorMessage = document.getElementById("signup-error-message");
    const successMessage = document.getElementById("signup-success-message");

    errorMessage.style.display = "none";
    successMessage.style.display = "none";

    if (password !== confirmPassword) {
        errorMessage.innerText = "Passwords do not match!";
        errorMessage.style.display = "block";
        return;
    }

    try {
        const user = await signUpUser(email, password);
        await set(ref(db, 'admins/' + user.uid), {
            fullName: fullName,
            email: email,
            jobTitle: jobTitle
        });
        successMessage.innerText = "Admin account created successfully!";
        successMessage.style.display = "block";

        setTimeout(() => {
            document.getElementById("signup-container").style.display = "none";
            window.location.href = 'admin_login.html'; // Redirect to login page after successful signup
        }, 1500);
    } catch (error) {
        console.error('Error during signup process:', error);
        errorMessage.innerText = "Error: " + error.message;
        errorMessage.style.display = "block";
    }
});