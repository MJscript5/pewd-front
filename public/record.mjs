import { db, auth } from './app.mjs';
import { ref, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { checkAuth } from './auth.mjs';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await checkAuth();
        fetchDataChanges();
    } catch (error) {
        console.error('User is not authenticated:', error);
        handleUnauthenticatedUser();
    }
});

function timeAgo(dateString) {
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

function fetchRecords(sortOrder = 'time_desc') {
    const user = auth.currentUser;

    if (user) {
        const recordsRef = ref(db, `users/${user.uid}/records`);

        onValue(recordsRef, (snapshot) => {
            const recordsContainer = document.getElementById('recordsContainer');
            recordsContainer.innerHTML = '';

            if (snapshot.exists()) {
                const records = [];

                snapshot.forEach((childSnapshot) => {
                    const record = childSnapshot.val();
                    records.push(record);
                });

                records.sort((a, b) => {
                    const dateA = new Date(`${a.Date} ${a.PhilippineTime}`);
                    const dateB = new Date(`${b.Date} ${b.PhilippineTime}`);

                    if (sortOrder === 'time_asc') {
                        return dateA - dateB;
                    } else if (sortOrder === 'time_desc') {
                        return dateB - dateA;
                    } else {
                        return 0; // Default case to handle unexpected sortOrder values
                    }
                });

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

                    const dateTimeDiv = document.createElement('div');
                    dateTimeDiv.className = 'date-time';
                    dateTimeDiv.textContent = recordDateTime;
                    recordDiv.appendChild(dateTimeDiv);

                    recordsContainer.appendChild(recordDiv);
                });
            } else {
                displayMessage('No records found', 'record');
            }
        }, (error) => {
            console.error('Error fetching records:', error);
            displayMessage('Error fetching records. Please try again later.', 'error');
        });
    } else {
        handleUnauthenticatedUser();
    }
}

function handleUnauthenticatedUser() {
    displayMessage('Please log in to view your records.', 'info');
    document.getElementById('sort').disabled = true;
}

function displayMessage(message, className) {
    const recordsContainer = document.getElementById('recordsContainer');
    recordsContainer.innerHTML = '';
    const messageDiv = document.createElement('div');
    messageDiv.className = className;
    messageDiv.textContent = message;
    recordsContainer.appendChild(messageDiv);
}

function fetchDataChanges() {
    const sortOption = document.getElementById('sort').value;
    fetchRecords(sortOption); 
}

window.fetchDataChanges = fetchDataChanges;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sort').value = 'time_desc'; 
    fetchDataChanges();
});