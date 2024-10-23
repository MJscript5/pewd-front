import { db, auth } from './app.mjs';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { checkAuth, redirectToLogin } from './auth.mjs';

// Keep track of the last posture status
let lastStatus = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await checkAuth();
        // User is authenticated, proceed with dashboard functionality
        updateData();
        requestNotificationPermission();
        setupLogoutButton();
    } catch (error) {
        console.error("User not logged in:", error);
        redirectToLogin();
    }
});

function updateData() {
    const randRef = ref(db, '/Sensor');

    onValue(randRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const postData = data.Posture;

            const rand = document.getElementById("data");
            const postureStatusImage = document.getElementById('postureStatusImage');
            const postureStatusIcon = document.getElementById('postureStatusIcon');
            rand.textContent = postData;

            if (postData === "Good Posture!") {
                postureStatusImage.src = "pics/2.png";
                postureStatusIcon.className = "good";
                rand.innerText = postData;
                rand.className = "good";
            } else if (postData === "Bad Posture Detected!" && lastStatus !== "bad") {
                postureStatusImage.src = "pics/1.png";
                postureStatusIcon.className = "bad";
                rand.innerText = postData;
                rand.className = "bad";

                // Send push notification if posture status is bad
                showNotification();
            }

            // Update last status
            lastStatus = postData;
        } else {
            console.error("postureStatusText is undefined or could not be found.");
        }
    }, (error) => {
        console.error('Error fetching data:', error);
    });
}

// Function to request notification permission
function requestNotificationPermission() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            if (permission !== "granted") {
                alert("You need to allow notifications to receive posture alerts.");
            }
        });
    }
}

// Function to show notification
function showNotification() {
    if (Notification.permission === "granted") {
        new Notification("Posture Alert", {
            body: "Poor posture detected!",
            icon: "pics/logo.png" 
        });
    }
}

function setupLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut().then(() => {
                redirectToLogin();
            }).catch((error) => {
                console.error('Error signing out:', error);
            });
        });
    }
}

updateData();
