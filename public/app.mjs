import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase, ref, onValue, set, push, get, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

let lastPosture = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        const usersRef = ref(db, 'users');
        get(usersRef).then((snapshot) => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                const matchedUser = Object.entries(users).find(([userId, userData]) => userData.email === user.email);

                if (matchedUser) {
                    const [userId] = matchedUser;
                    sessionStorage.setItem('userId', userId);  // Store userId for further use
                } else {
                    console.error('No user data found for the authenticated user.');
                }
            } else {
                console.error('No users found in the database.');
            }
        }).catch((error) => {
            console.error('Error fetching user data:', error);
        });
    } else {
        console.error('User is not authenticated.');
    }
});

export function addNewRecord(postureData, date, time) {
    const newRecordId = generateUniqueId();
    const userId = sessionStorage.getItem('userId');  // Retrieve userId from sessionStorage

    if (userId) {
        const recordsRef = ref(db, `users/${userId}/records`);
        get(recordsRef).then((snapshot) => {
            if (snapshot.exists()) {
                const records = snapshot.val();
                const isDuplicate = Object.values(records).some(record => 
                    record.Posture === postureData && record.Date === date && record.PhilippineTime === time
                );

                if (isDuplicate) {
                    console.log('Duplicate record detected. Skipping addition.');
                    return;
                }
            }

            const recordRef = ref(db, `users/${userId}/records/${newRecordId}`);
            set(recordRef, {
                Posture: postureData,
                Date: date,
                PhilippineTime: time
            }).then(() => {
                console.log('Record added successfully to user\'s node.');
            }).catch((error) => {
                console.error('Error adding record to user\'s node:', error);
            });
        }).catch((error) => {
            console.error('Error checking for duplicate records:', error);
        });
    } else {
        console.error('No userId found in sessionStorage.');
    }
}

export async function transferTempRecords(userId) {
    const tempRecordsRef = ref(db, 'tempRecords');
    const userRecordsRef = ref(db, `users/${userId}/records`);

    try {
        const snapshot = await get(tempRecordsRef);
        if (snapshot.exists()) {
            const tempRecords = snapshot.val();
            await set(userRecordsRef, tempRecords);
            await remove(tempRecordsRef);
            console.log('Temporary records transferred successfully.');
        }
    } catch (error) {
        console.error('Error transferring temporary records:', error);
    }
}

export function fetchLastPosture() {
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

export function setLastPosture(posture) {
    lastPosture = posture;
    set(ref(db, '/Sensor/LastPosture'), posture);
}

function watchPostureChanges() {
    const postureRef = ref(db, '/Sensor/Posture');

    fetchLastPosture().then(() => {
        onValue(postureRef, (snapshot) => {
            if (snapshot.exists()) {
                const postureData = snapshot.val();
                const now = new Date();
                const date = now.toLocaleDateString();
                const time = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Manila' });

                console.log('Current Posture:', postureData);

                if ((lastPosture === 'Good Posture!' && postureData === 'Bad Posture Detected!') ||
                    (lastPosture === 'Bad Posture Detected!' && postureData === 'Good Posture!')) {
                    if (lastPosture !== postureData) {
                        addNewRecord(postureData, date, time); 
                        setLastPosture(postureData);
                    }
                }
                lastPosture = postureData;
            }
        }, (error) => {
            console.error('Error fetching posture data:', error);
        });
    }).catch((error) => {
        console.error('Error fetching last posture:', error);
    });
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

    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}-${randomStr}`;
}

async function fetchUserData(username) {
    const usersRef = ref(db, 'users');
    try {
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            const matchedUser = Object.entries(users).find(([userId, userData]) => userData.username === username);

            if (matchedUser) {
                const [userId, userData] = matchedUser;
                sessionStorage.setItem('userId', userId);  // Store userId for further use

                if(userData.profilePicture) {
                    document.getElementById('profile-picture').src = userData.profilePicture;
                }
                populateUserProfile(userData, userId);
            } else {
                console.error('No user data found for the provided username.');
            }
        } else {
            console.error('No users found in the database.');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    watchPostureChanges();
});

export { db, auth };