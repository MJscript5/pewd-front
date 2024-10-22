import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDO9p6D7W1XnL4tGNv3cLC-_hE-B02D3-0",
    authDomain: "pewds-prototype.firebaseapp.com",
    databaseURL: "https://pewds-prototype-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "pewds-prototype",
    storageBucket: "pewds-prototype.appspot.com",
    messagingSenderId: "262087676411",
    appId: "1:262087676411:web:11593e144b64dcf2ed7b5e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Function to sign up a new user using Firebase Authentication
export async function signUpUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User signed up:', user);
        return user;
    } catch (error) {
        console.error('Error signing up:', error);
        throw new Error(error.message);
    }
}

// Function to sign in a user using Firebase Authentication
export async function signInUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User signed in:', user);
        return user;
    } catch (error) {
        console.error('Error signing in:', error);
        throw new Error(error.message);
    }
}

// Function to sign out the current user
export async function signOutUser() {
    try {
        await signOut(auth);
        console.log('User signed out.');
    } catch (error) {
        console.error('Error signing out:', error);
        throw new Error(error.message);
    }
}

// Function to add a new record
export function addNewRecord(postureData, date, time) {
    const newRecordId = generateUniqueId(); // Generate a unique ID for the record
    const recordRef = ref(db, 'Sensor/Record/' + newRecordId);
    
    set(recordRef, {
        Posture: postureData,
        Date: date,
        PhilippineTime: time
    }).then(() => {
        console.log('Record added successfully.');
    }).catch((error) => {
        console.error('Error adding record:', error);
    });
}

// Function to generate a unique ID for each record
function generateUniqueId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0'); // Optional milliseconds
    const randomStr = Math.random().toString(36).substr(2, 5); // Optional random string

    // Combine into the desired format with added uniqueness
    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}-${randomStr}`;
}

let lastPosture = null;

console.log('Last Posture:', lastPosture);

function watchPostureChanges() {
    const postureRef = ref(db, '/Sensor/Posture');

    onValue(postureRef, (snapshot) => {
        if (snapshot.exists()) {
            const postureData = snapshot.val();
            const now = new Date();
            const date = now.toLocaleDateString();
            const time = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Manila' });

            console.log('Current Posture:', postureData);

            // Check if the posture has changed compared to the last known posture
            if (postureData !== lastPosture) {
                addNewRecord(postureData, date, time);
                lastPosture = postureData; // Update the lastPosture to the current one
            }
        }
    }, (error) => {
        console.error('Error fetching posture data:', error);
    });
}

// Call the function to start watching for posture changes
document.addEventListener('DOMContentLoaded', () => {
    watchPostureChanges();
});

export { db, auth };