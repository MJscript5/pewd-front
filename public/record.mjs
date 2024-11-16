import { db, auth } from './app.mjs';
import { ref, onValue, query, orderByChild, get } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { checkAuth, redirectToLogin } from './auth.mjs';

let isLoading = true;

// Combined DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded event fired");
    try {
        console.log("Checking authentication...");
        await checkAuth();
        console.log("User is authenticated");

        // Initialize default sort value and call fetchDataChanges
        document.getElementById('sort').value = 'time_desc'; 
        fetchDataChanges();
    } catch (error) {
        console.error("User not logged in:", error);
        handleUnauthenticatedUser();
    }
});

// Utility function to format time duration
function timeAgo(dateString) {
    console.log(`Calculating time ago for date: ${dateString}`);
    const now = new Date();
    const recordDate = new Date(dateString);
    const diff = Math.floor((now - recordDate) / 1000);

    if (diff < 60) {
        return `${diff} sec${diff === 1 ? '' : 's'} ago`;
    } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} hr${hours === 1 ? '' : 's'} ago`;
    } else {
        const days = Math.floor(diff / 86400);
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }
}

// Fetch and display records with sorting
async function fetchDataChanges() {
    console.log("fetchDataChanges function called");
    const sortOption = document.getElementById('sort').value;
    fetchRecords(sortOption);
}

// Function to retrieve user UID by username
async function getUserIdByUsername(username) {
    const usersRef = ref(db, 'users');
    
    try {
        // Get all users data from the 'users' node
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            console.log('Users in database:', users);  // Debugging line
            
            // Find the user with the matching username
            const matchedUser = Object.entries(users).find(([userId, userData]) => 
                userData.username && userData.username.toLowerCase() === username.toLowerCase());
            
            if (matchedUser) {
                const [userId] = matchedUser;
                console.log('User ID found:', userId); // Debugging step
                return userId;
            } else {
                console.error('No user found with the provided username.');
                return null;
            }
        } else {
            console.error('No users data found in the database.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user data by username:', error);
        return null;
    }
}

async function fetchRecords(sortOrder = 'time_desc') {
    isLoading = true;
    updateLoadingState();

    try {
        const user = auth.currentUser;
        if (!user || !user.username) {
            console.error('User is not authenticated or username is missing');
            displayMessage('User is not authenticated or username is missing', 'error');
            handleUnauthenticatedUser();
            return;
        }

        // Log the username of the authenticated user
        console.log('Authenticated user:', user.username);

        // Retrieve the user ID based on the logged-in user's username
        const userId = await getUserIdByUsername(user.username);

        if (!userId) {
            displayMessage('Unable to identify user. Please log in again.', 'error');
            return;
        }

        // Use the retrieved userId to access the records
        const recordsRef = ref(db, `users/${userId}/records`);
        const recordsQuery = query(recordsRef, orderByChild('timestamp'));

        onValue(recordsQuery, (snapshot) => {
            console.log("Data snapshot received:", snapshot.val()); // Debugging step
            const recordsContainer = document.getElementById('recordsContainer');
            recordsContainer.innerHTML = '';

            if (snapshot.exists()) {
                const records = [];

                snapshot.forEach((childSnapshot) => {
                    const record = childSnapshot.val();
                    records.push(record);
                });

                // If sorting is required, apply it here
                records.sort((a, b) => {
                    const dateA = new Date(`${a.Date} ${a.PhilippineTime}`);
                    const dateB = new Date(`${b.Date} ${b.PhilippineTime}`);
                    return sortOrder === 'time_asc' ? dateA - dateB : dateB - dateA;
                });

                records.forEach(record => {
                    const recordDiv = createRecordElement(record);
                    recordsContainer.appendChild(recordDiv);
                });
            } else {
                displayMessage('No records found', 'info');
            }

            isLoading = false;
            updateLoadingState();
        }, (error) => {
            console.error('Error fetching records:', error);
            displayMessage('Error fetching records. Please try again later.', 'error');
            isLoading = false;
            updateLoadingState();
        });
    } catch (error) {
        console.error("Error fetching data changes:", error);
        displayMessage('Error fetching data changes. Please try again later.', 'error');
        isLoading = false;
        updateLoadingState();
    }
}

// Function to create a record element for display
function createRecordElement(record) {
    const recordDiv = document.createElement('div');
    recordDiv.className = 'record';

    const timeDurationDiv = document.createElement('div');
    timeDurationDiv.className = 'time-duration';
    const recordDateTime = `${record.Date || 'N/A'} ${record.PhilippineTime || 'N/A'}`;
    timeDurationDiv.textContent = timeAgo(recordDateTime);
    recordDiv.appendChild(timeDurationDiv);

    const postureDiv = document.createElement('div');
    postureDiv.className = 'posture';
    postureDiv.textContent = record.Posture || 'N/A';
    recordDiv.appendChild(postureDiv);

    const dateTimeDiv = document.createElement('div');
    dateTimeDiv.className = 'date-time';
    dateTimeDiv.textContent = recordDateTime;
    recordDiv.appendChild(dateTimeDiv);

    return recordDiv;
}

// Display user message in the records container
function displayMessage(message, className) {
    const recordsContainer = document.getElementById('recordsContainer');
    recordsContainer.innerHTML = '';
    const messageDiv = document.createElement('div');
    messageDiv.className = className;
    messageDiv.textContent = message;
    recordsContainer.appendChild(messageDiv);
}

// Handle unauthenticated user case
function handleUnauthenticatedUser() {
    console.log("Handling unauthenticated user");
    displayMessage('Please log in to view your records.', 'info');
    // redirectToLogin();
    document.getElementById('sort').disabled = true;
}

// Update the loading indicator visibility
function updateLoadingState() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }
}

// Expose fetchDataChanges globally to be used in HTML
window.fetchDataChanges = fetchDataChanges;

export { fetchRecords, fetchDataChanges };
