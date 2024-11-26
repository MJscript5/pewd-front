import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase, ref, onValue, set, push, get, remove, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
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
        // await transferTempRecords(user.uid); 

        // Retrieve the username associated with this email
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            const matchedUser = Object.entries(users).find(([userId, userData]) => userData.username === username);

            if (matchedUser) {
                const [userId] = matchedUser;
                sessionStorage.setItem('userId', userId);  
                console.log('User ID retrieved and stored:', userId);
                return userId;  
            } else {
                console.error('No user data found for the provided username.');
                return null;
            }
        } else {
            console.error('No users found in the database.');
        }

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

// Global variable to store the latest posture data
let latestPostureData = null;
let unloadTriggered = false; 

// Function to update the latest posture data
function updateLatestPostureData(postureData) {
    if (postureData && postureData !== "Unknown") {
        latestPostureData = postureData;
    }
}

// Helper function to fetch the latest record posture
async function getLastPostureRecord(refPath) {
    const recordsRef = ref(db, refPath);
    const snapshot = await get(recordsRef);

    if (snapshot.exists()) {
        const records = snapshot.val();
        const lastRecordKey = Object.keys(records).pop(); 
        return records[lastRecordKey].Posture; 
    }
    return null;
}

// Function to add a new record (for users, admins, or when no user is signed in)
// async function addRecord(postureData, date, time) {
//     const retrievedUserId = sessionStorage.getItem('userId');

//     if (!postureData || postureData === "Unknown") {
//         console.log('Invalid posture data. Record creation skipped.');
//         return;
//     }

//     const newRecordId = `${generateUniqueId()}`;
//     const record = {
//         Posture: postureData,
//         Date: date,
//         PhilippineTime: time,
//     };

//     // Check for duplicate posture in Sensor/Record
//     const lastPosture = await getLastPostureRecord(`Sensor/Record`);
//     if (lastPosture === postureData) {
//         console.log('Duplicate posture detected in Sensor/Record. Skipping record creation.');
//         return;
//     }

//     // Store the record data in the general Sensor/Record node
//     try {
//         await set(ref(db, `Sensor/Record/${newRecordId}`), record);
//         console.log('Record added successfully to Sensor/Record.');
//     } catch (error) {
//         console.error('Error adding record to Sensor/Record:', error);
//         return;
//     }

//     const user = auth.currentUser;

//     if (user) {
//        const userId = user.uid;

//         // Check if the logged-in user is an admin
//         const adminRef = ref(db, `admins/${userId}`);
//         try {
//         const snapshot = await get(adminRef);

//             if (snapshot.exists()) {
//                 // Admin account detected, check for duplicates in tempRecords
//                 const lastTempPosture = await getLastPostureRecord(`Sensor/tempRecords`);
//                 if (lastTempPosture === postureData) {
//                     console.log('Duplicate posture detected in tempRecords. Skipping record creation.');
//                     return;
//                 }

//                 const tempRecordsRef = ref(db, `Sensor/tempRecords/${newRecordId}`);
//                 try {
//                     await set(tempRecordsRef, record);
//                     console.log('Admin account detected. Record added to tempRecords.');
//                 } catch (error) {
//                     console.error('Error adding record to tempRecords:', error);
//                 }
//             } else {
//                 // User account detected, check for duplicates in user records
//                 const lastUserPosture = await getLastPostureRecord(`users/${retrievedUserId}/records`);
//                 if (lastUserPosture === postureData) {
//                     console.log('Duplicate posture detected in user records. Skipping record creation.');
//                     return;
//                 }

//                 const userRecordsRef = ref(db, `users/${retrievedUserId}/records/${newRecordId}`);
//                 try {
//                     await set(userRecordsRef, record);
//                     console.log('Record added to user account. Generated Record ID:', newRecordId);
//                 } catch (error) {
//                     console.error('Error adding record to user account:', error);
//                     if (error.message.includes('Permission denied')) {
//                         console.error('Check Firebase security rules for users/${retrievedUserId}/records');
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error('Error checking admin status:', error);
//             // Proceed with user logic as a fallback
//             const lastUserPosture = await getLastPostureRecord(`users/${retrievedUserId}/records`);
//             if (lastUserPosture === postureData) {
//                 console.log('Duplicate posture detected in user records. Skipping record creation.');
//                 return;
//             }
    
//             const userRecordsRef = ref(db, `users/${retrievedUserId}/records/${newRecordId}`);
//             try {
//                 await set(userRecordsRef, record);
//                 console.log('Record added to user account (fallback). Generated Record ID:', newRecordId);
//             } catch (error) {
//                 console.error('Error adding record to user account (fallback):', error);
//                 if (error.message.includes('Permission denied')) {
//                     console.error(`Check Firebase security rules for users/${retrievedUserId}/records`);
//               }
//             }
//         }
//     } else {
//         // No user is logged in, check for duplicates in tempRecords
//         const lastTempPosture = await getLastPostureRecord(`Sensor/tempRecords`);
//         if (lastTempPosture === postureData) {
//             console.log('Duplicate posture detected in tempRecords. Skipping record creation.');
//             return;
//         }

//         const tempRecordsRef = ref(db, `Sensor/tempRecords/${newRecordId}`);
//         try {
//             await set(tempRecordsRef, record);
//             console.log('No logged-in account detected. Record added to tempRecords.');
//         } catch (error) {
//             console.error('Error adding record to tempRecords:', error);
//         }
//     }
// }

async function addRecord(postureData, date, time) {
    const retrievedUserId = sessionStorage.getItem('userId');
    console.log('Using userId from session storage:', retrievedUserId);

    if (!retrievedUserId) {
        console.log('No user ID found in session storage. Aborting record creation.');
        return;
    }

    const newRecordId = `${generateUniqueId()}`;
    const record = {
        Posture: postureData,
        Date: date,
        PhilippineTime: time,
    };

    const lastPosture = await getLastPostureRecord(`Sensor/Record`);
    if (lastPosture === postureData) {
        console.log('Duplicate posture detected. Skipping record creation.');
        return;
    }

    // Add the record to the general records database (this will be for all users)
    try {
        await set(ref(db, `Sensor/Record/${newRecordId}`), record);
        console.log('Record added successfully.');
    } catch (error) {
        console.error('Error adding record:', error);
        return;
    }

    // Now handle user-specific records
    try {
        const user = auth.currentUser;  // Get the currently logged-in user

        if (user) {
            // User is logged in, store records in user-specific records node
            const firebaseUserId = user.uid;
            console.log('Current Firebase user UID:', firebaseUserId);

            // Check if the user is an admin by checking in the admins path
            const adminRef = ref(db, `admins/${firebaseUserId}`);
            const snapshot = await get(adminRef);
            if (snapshot.exists()) {
                // If the user is an admin, save to tempRecords
                await set(ref(db, `Sensor/tempRecords/${newRecordId}`), record);
                console.log('Record added to tempRecords for admin.');
            } else {
                // Regular user: Save to user-specific records using the custom user ID
                await set(ref(db, `users/${retrievedUserId}/records/${newRecordId}`), record);
                console.log('Record added to user-specific records.');
            }
        } else {
            console.log('No logged-in user detected. Saving in tempRecords.');
            // If no user is logged in, save to tempRecords by default
            await set(ref(db, `Sensor/tempRecords/${newRecordId}`), record);
        }
    } catch (error) {
        console.error('Error processing user records:', error);
    }
}




// Function to save to tempRecords when the app is closed or index page is opened
async function saveToTempRecordsOnUnload(date, time) {
    if (unloadTriggered || !latestPostureData) return; 
    unloadTriggered = true;

    const lastTempPosture = await getLastPostureRecord(`Sensor/tempRecords`);
    if (lastTempPosture === latestPostureData) {
        console.log('Duplicate posture detected in tempRecords on unload. Skipping record creation.');
        return;
    }

    const newRecordId = `${generateUniqueId()}-${Date.now()}`;
    const record = {
        Posture: latestPostureData,
        Date: date,
        PhilippineTime: time,
    };

    const tempRecordsRef = ref(db, `Sensor/tempRecords/${newRecordId}`);
    try {
        await set(tempRecordsRef, record);
        console.log('Record added to tempRecords on unload or index page load.');
    } catch (error) {
        console.error('Error adding record to tempRecords on unload:', error);
    }
}

// Add event listener for beforeunload (when the app is closed or refreshed)
window.addEventListener('beforeunload', () => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    saveToTempRecordsOnUnload(date, time);
});

// Call saveToTempRecordsOnUnload on index page load
if (window.location.pathname.includes('index')) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    saveToTempRecordsOnUnload(date, time);
}



// async function transferTempRecords() {
//     const retrievedUserId = sessionStorage.getItem('userId');

//     if (!retrievedUserId) {
//         // console.error('User ID not available in session storage. Cannot transfer temp records.');
//         return;
//     }

//     console.log('Transferring temp records for user:', retrievedUserId);
//     const tempRecordsRef = ref(db, 'Sensor/tempRecords');
//     const userRecordsBaseRef = ref(db, `users/${retrievedUserId}/records`);

//     try {
//         const tempRecordsSnapshot = await get(tempRecordsRef);

//         if (tempRecordsSnapshot.exists()) {
//             const tempRecords = tempRecordsSnapshot.val();
//             console.log('Temp records found:', tempRecords);

//             for (const [key, record] of Object.entries(tempRecords)) {
//                 const newRecordId = generateUniqueId();
//                 const newRecordRef = ref(db, `users/${retrievedUserId}/records/${newRecordId}`);

//                 await set(newRecordRef, record);
//                 await remove(ref(db, `Sensor/tempRecords/${key}`));
//             }

//             console.log('All temp records transferred successfully.');
//         } else {
//             console.log('No temp records to transfer.');
//         }
//     } catch (error) {
//         console.error('Error transferring temp records:', error);
//     }
// }

// Function to generate a unique ID for each record

async function transferTempRecords() {
    const retrievedUserId = sessionStorage.getItem('userId');

    if (!retrievedUserId) {
        console.log('User ID not available in session storage. Cannot transfer temp records.');
        return;
    }

    console.log('Transferring temp records for user:', retrievedUserId);
    const tempRecordsRef = ref(db, 'Sensor/tempRecords');
    const userRecordsBaseRef = ref(db, `users/${retrievedUserId}/records`);

    try {
        const tempRecordsSnapshot = await get(tempRecordsRef);

        if (tempRecordsSnapshot.exists()) {
            const tempRecords = tempRecordsSnapshot.val();
            console.log('Temp records found:', tempRecords);

            for (const [key, record] of Object.entries(tempRecords)) {
                const newRecordId = generateUniqueId();
                const newRecordRef = ref(db, `users/${retrievedUserId}/records/${newRecordId}`);

                await set(newRecordRef, record);
                await remove(ref(db, `Sensor/tempRecords/${key}`));
            }

            console.log('All temp records transferred successfully.');
        } else {
            console.log('No temp records to transfer.');
        }
    } catch (error) {
        console.error('Error transferring temp records:', error);
    }
}


function generateUniqueId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0'); 
    const randomStr = Math.random().toString(36).substr(2, 5);

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

// function watchPostureChanges() {
//     const postureRef = ref(db, '/Sensor/Posture');
//     let lastPosture = null;

//     onValue(postureRef, (snapshot) => {
//         if (snapshot.exists()) {
//             const postureData = snapshot.val();
//             const now = new Date();
//             const date = now.toLocaleDateString();
//             const time = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Manila' });

//             if ((lastPosture === 'Good Posture!' && postureData === 'Bad Posture Detected!') ||
//                 (lastPosture === 'Bad Posture Detected!' && postureData === 'Good Posture!')) {
//                 addRecord(postureData, date, time);
//             }
//             lastPosture = postureData;
//         }
//     });
// }

// Handle auth state changes

function watchPostureChanges() {
    // Define the reference to the posture data path in Firebase
    const postureRef = ref(db, '/Sensor/Posture');
    let lastPosture = null;
    let lastPostureTime = null;
    const DEBOUNCE_THRESHOLD = 3000; // 3 seconds

    // Listen for changes in the posture data
    onValue(postureRef, (snapshot) => {
        if (snapshot.exists()) {
            const postureData = snapshot.val();
            const now = new Date();
            const date = now.toLocaleDateString();
            const time = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Manila' });

            // Implement debouncing to avoid rapid consecutive updates
            if (lastPostureTime && (now - lastPostureTime < DEBOUNCE_THRESHOLD)) {
                console.log('Debouncing rapid posture change...');
                return;
            }

            // Check for changes between Good and Bad posture
            if ((lastPosture === 'Good Posture!' && postureData === 'Bad Posture Detected!') ||
                (lastPosture === 'Bad Posture Detected!' && postureData === 'Good Posture!')) {
                addRecord(postureData, date, time);
                lastPostureTime = now; // Update timestamp
            }

            // Update the last known posture state
            lastPosture = postureData;
        }
    });
}

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