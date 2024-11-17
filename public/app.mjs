import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase, ref, onValue, set, push, get, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDO9p6D7W1XnL4tGNv3cLC-_hE-B02D3-0",
    authDomain: "pewds-prototype.firebaseapp.com",
    databaseURL: "https://pewds-prototype-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "pewds-prototype",
    storageBucket: "pewds-prototype.appspot.com",
    messagingSenderId: "262087676411",
    appId: "1:262087676411:web:11593e144b64dcf2ed7b5e"
};

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
        await transferTempRecords(user.uid); // Transfer temporary records after sign-in
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
async function addRecord(postureData, date, time) {

    const newRecordId = generateUniqueId();
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

    const record = { Posture: postureData, Date: date, PhilippineTime: time };
    const user = auth.currentUser;

    if (user) {
        // User is logged in, store in their records
        const userRecordsRef = ref(db, `users/${retrievedUserId}/records/${newRecordId}`);
        await set(userRecordsRef, record);
        console.log('Generated Record ID:', newRecordId);

    } else {
        // User is not logged in, store in temporary records
        const tempRecordsRef = ref(db, `Sensor/tempRecords/${newRecordId}`);
        await set(tempRecordsRef, record);
        console.log('Temp Generated Record ID:', newRecordId);
    }
}

// Retrieve the user ID from sessionStorage and store it in a variable
const retrievedUserId = sessionStorage.getItem('userId');
if (!retrievedUserId) {
    console.error('User ID is not available in sessionStorage. Cannot fetch user-specific records.');
    // return;
}

async function transferTempRecords(userId) {
    console.log('Transferring temp records for user:', userId); // Check if the function is being called
    const tempRecordsRef = ref(db, 'Sensor/tempRecords'); // Correct path for temp records
    const userRecordsBaseRef = ref(db, `users/${retrievedUserId}/records`); // Base path

    try {
        const tempRecordsSnapshot = await get(tempRecordsRef);

        if (tempRecordsSnapshot.exists()) {
            const tempRecords = tempRecordsSnapshot.val();
            console.log('Temp records found:', tempRecords); // Log the retrieved records

            for (const [key, record] of Object.entries(tempRecords)) {
                const newRecordId = generateUniqueId(); // Use a new unique ID for each record
                const newRecordRefPath = `users/${retrievedUserId}/records/${newRecordId}`;
                console.log('Setting record at path:', newRecordRefPath); // Debug the path

                const newRecordRef = ref(db, newRecordRefPath);
                await set(newRecordRef, record); // Set the record under the user's path
                await remove(ref(db, `Sensor/tempRecords/${key}`)); // Remove the temp record
            }

            console.log('All temp records transferred successfully.');
        } else {
            console.log('No temp records to transfer.');
        }
    } catch (error) {
        console.error('Error transferring temp records:', error);
    }
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

function fetchLastPosture() {
    return new Promise((resolve, reject) => {
        const lastPostureRef = ref(db, '/Sensor/LastPosture');
        onValue(lastPostureRef, (snapshot) => {
            if (snapshot.exists()) {
                lastPosture = snapshot.val();
                resolve(lastPosture);
            } else {
                resolve(null);
            }
        }, (error) => {
            reject(error);
        });
    });
}

function watchPostureChanges() {
    const postureRef = ref(db, '/Sensor/Posture');
    let lastPosture = null;

    onValue(postureRef, (snapshot) => {
        if (snapshot.exists()) {
            const postureData = snapshot.val();
            const now = new Date();
            const date = now.toLocaleDateString();
            const time = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Manila' });

            if ((lastPosture === 'Good Posture!' && postureData === 'Bad Posture Detected!') ||
                (lastPosture === 'Bad Posture Detected!' && postureData === 'Good Posture!')) {
                addRecord(postureData, date, time);
            }
            lastPosture = postureData;
        }
    });
}

// Handle auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // console.log('User is logged in:', user.uid);
        transferTempRecords(user.uid);
    } else {
        console.log('User is logged out');
    }
});

// Call the function to start watching for posture changes
document.addEventListener('DOMContentLoaded', () => {
    watchPostureChanges();
});

export { db, auth, addRecord, transferTempRecords, watchPostureChanges };