import { db, auth, setLastPosture, lastPosture } from './app.mjs';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { checkAuth, redirectToLogin } from './auth.mjs';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await checkAuth();
        // User is authenticated, proceed with dashboard functionality
        // await fetchLastPosture(); // Fetch the last posture status
        updateData();
        requestNotificationPermission();
        setupLogoutButton();
    } catch (error) {
        console.error("User not logged in:", error);
        redirectToLogin();
    }
});

function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
                if (permission !== "granted") {
                    console.log("Notification permission not granted.");
                }
            });
        }
    } else {
        console.log("Notifications are not supported on this device.");
    }
}

function updateData() {
    const randRef = ref(db, '/Sensor');

    onValue(randRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const postData = data.Posture;

            const rand = document.getElementById("data");
            const postureStatusImage = document.getElementById('postureStatusImage');
            rand.textContent = postData;

            if (postData === "Good Posture!") {
                postureStatusImage.src = "pics/2.png";
                rand.innerText = postData;
                rand.className = "good";
                console.log("Applied good class");
            } else if (postData === "Bad Posture Detected!" && lastPosture !== "Bad Posture Detected!") {
                postureStatusImage.src = "pics/1.png";
                rand.innerText = postData;
                rand.className = "bad";
                console.log("Applied bad class");

                // Send push notification if posture status is bad and different from last status
                if (lastPosture !== postData) {
                    showNotification();
                }
            }

            // Update last posture
            setLastPosture(postData);
        } else {
            console.error("postureStatusText is undefined or could not be found.");
        }
    }, (error) => {
        console.error('Error fetching data:', error);
    });
}

function showNotification() {
    if ('Notification' in window && Notification.permission === "granted") {
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
                clearStorage();
            }).catch((error) => {
                console.error('Error signing out:', error);
            });
        });
    }
}

function clearStorage() {
    sessionStorage.clear();
    localStorage.clear();
}
