import { db } from './app.mjs';
import { ref, get, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { checkAuth, redirectToLogin } from './auth.mjs';


document.addEventListener('DOMContentLoaded', async () => {
    try {
        await checkAuth();
        // User is authenticated, proceed with page functionality
        const username = sessionStorage.getItem('username');
        if (username) {
            const userId = await retrieveUserIdByUsername(username);
            if (userId) {
                fetchDataChanges();  // Proceed to fetch sensor records if user is authenticated
            } else {
                console.error('User ID not found for the provided username.');
                redirectToLogin();  // Redirect to login if user ID is not found
            }
        } else {
            console.error('No username found in sessionStorage.');
            redirectToLogin();  // Redirect to login if no username is stored
        }
    } catch (error) {
        console.error("User not logged in:", error);
        redirectToLogin();
    }
});

// Function to format time duration
function timeAgo(dateString) {
    const now = new Date();
    const recordDate = new Date(dateString);
    const diff = Math.floor((now - recordDate) / 1000); // difference in seconds

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

// Function to retrieve user ID based on username
async function retrieveUserIdByUsername(username) {
    const usersRef = ref(db, 'users');
    try {
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const users = snapshot.val();
            const matchedUser = Object.entries(users).find(([userId, userData]) => userData.username === username);

            if (matchedUser) {
                const [userId] = matchedUser;
                sessionStorage.setItem('userId', userId);  // Store userId for further use
                // console.log('User ID retrieved and stored:', userId);
                return userId;  // Return userId if needed for further processing
            } else {
                console.error('No user data found for the provided username.');
                return null;
            }
        } else {
            console.error('No users found in the database.');
            return null;
        }
    } catch (error) {
        console.error('Error retrieving user ID:', error);
        return null;
    }
}

function fetchRecords(sortOrder = 'time_desc') {
    // Retrieve the user ID from sessionStorage and store it in a variable
    const retrievedUserId = sessionStorage.getItem('userId');
    if (!retrievedUserId) {
        console.error('User ID is not available in sessionStorage. Cannot fetch user-specific records.');
        return;
    }

    // Use the variable to create a reference to the user's specific records
    const recordsRef = ref(db, `users/${retrievedUserId}/records`);

    onValue(recordsRef, (snapshot) => {
        const recordsContainer = document.getElementById('recordsContainer');
        recordsContainer.innerHTML = ''; // Clear existing records

        if (snapshot.exists()) {
            const records = [];

            snapshot.forEach((childSnapshot) => {
                const record = childSnapshot.val();
                records.push(record);
            });

            // Sort records based on the selected option
            records.sort((a, b) => {
                const dateA = new Date(`${a.Date} ${a.PhilippineTime}`);
                const dateB = new Date(`${b.Date} ${b.PhilippineTime}`);

                if (sortOrder === 'time_asc') {
                    return dateA - dateB;
                } else if (sortOrder === 'time_desc') {
                    return dateB - dateA;
                }
            });

            // Insert sorted records into the container
            records.forEach(record => {
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

                recordsContainer.appendChild(recordDiv);

                const dateTimeDiv = document.createElement('div');
                dateTimeDiv.className = 'date-time';
                dateTimeDiv.textContent = recordDateTime;
                recordDiv.appendChild(dateTimeDiv);
            });
        } else {
            // Handle the case where there are no records
            const noRecordsDiv = document.createElement('div');
            noRecordsDiv.className = 'record';
            noRecordsDiv.textContent = 'No records found';
            recordsContainer.appendChild(noRecordsDiv);
        }
    }, (error) => {
        console.error('Error fetching records:', error);
    });
}


// Function to handle sorting based on user selection
function fetchDataChanges() {
    const sortOption = document.getElementById('sort').value;
    fetchRecords(sortOption); 
}

// Attach the function to the window object to make it accessible in HTML
window.fetchDataChanges = fetchDataChanges;

// Call fetchDataChanges on page load to display records with default sorting
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sort').value = 'time_desc'; 
    fetchDataChanges();
});