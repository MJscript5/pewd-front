import { db } from './app.mjs';
import { ref, onValue, get } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

// Redirect to login if the admin is not logged in
if (!sessionStorage.getItem('adminEmail') && !localStorage.getItem('adminEmail')) {
  window.location.href = './admin_login.html';
}


// In-memory variable to store currently displayed records
let currentRecords = [];


// Function to save unique user data to localStorage
function saveUserData(userId, userData) {
  const existingUsers = JSON.parse(localStorage.getItem('searchedUsers')) || {};

  // Check if the user data is already stored
  if (existingUsers[userId]) {
      console.log(`User ${userId} is already saved. Skipping duplicate.`);
      return;
  }

  // Save new user data
  existingUsers[userId] = userData;
  localStorage.setItem('searchedUsers', JSON.stringify(existingUsers));
}



export function logout() {
  localStorage.removeItem('authToken');
  sessionStorage.clear();
  window.location.href = './admin_login.html';
}


export function viewRecords(userId) {
  const modal = document.getElementById('recordsModal');
  const content = document.getElementById('recordsContent');
  const sortOrder = document.getElementById('sortOrder').value;
  const existingUsers = JSON.parse(localStorage.getItem('searchedUsers')) || {};

  // Retrieve records from localStorage if available
  currentRecords = existingUsers[userId]?.records ? Object.values(existingUsers[userId].records) : [];

  // If no records are found in localStorage, fetch from Firebase
  if (currentRecords.length === 0) {
      const recordsRef = ref(db, `users/${userId}/records`);
      onValue(recordsRef, (snapshot) => {
          if (snapshot.exists()) {
              currentRecords = Object.values(snapshot.val());
              displayRecords(currentRecords, sortOrder);
          } else {
              content.innerHTML = '<p>No records found for this user.</p>';
          }
      });
  } else {
      displayRecords(currentRecords, sortOrder);
  }

  modal.style.display = 'block';
}

// Helper function to display sorted records
function displayRecords(records, sortOrder) {
  const content = document.getElementById('recordsContent');

  // Sort the records based on the selected sort order
  records.sort((a, b) => {
      const dateA = new Date(`${a.Date} ${a.PhilippineTime}`);
      const dateB = new Date(`${b.Date} ${b.PhilippineTime}`);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Render sorted records
  content.innerHTML = records.map(record => `
      <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
          <h3>${record.Posture}</h3>
          <p>Date: ${record.Date}</p>
          <p>Time: ${record.PhilippineTime}</p>
      </div>
  `).join('');
}

// Attach viewRecords and displayRecords to the global window object
window.viewRecords = viewRecords;

// Event listener for the sort order dropdown
document.getElementById('sortOrder').addEventListener('change', () => {
    displayRecords(currentRecords, document.getElementById('sortOrder').value);
});


export function fetchUserRecords(userId) {
  const usersRef = ref(db, `users/${userId}`);
  const userTableBody = document.getElementById('userTableBody');

  // Check if the user is already displayed in the table
  if (document.getElementById(`user-row-${userId}`)) {
      alert('User data is already displayed.');
      return;
  }

  onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
          const userData = snapshot.val();

          // Save user data in localStorage
          saveUserData(userId, userData);

          // Append a new row to the table with a unique ID
          userTableBody.innerHTML += `
              <tr id="user-row-${userId}">
                <td>${userId}</td>
                <td>${userData.fullName}</td>
                <td>${userData.email}</td>
                <td>${userData.phoneNumber}</td>
                <td>
                    <button class="btn view-records" onclick="viewRecords('${userId}')">View All Records</button>
                </td>
              </tr>
          `;
      } else {
          alert('User not found');
      }
  });
}

export function loadStoredUserData() {
  const existingUsers = JSON.parse(localStorage.getItem('searchedUsers')) || {};
  const userTableBody = document.getElementById('userTableBody');

  Object.entries(existingUsers).forEach(([userId, userData]) => {
      // Skip if the user is already displayed in the table
      if (document.getElementById(`user-row-${userId}`)) {
          return;
      }

      // Append user data to the table
      userTableBody.innerHTML += `
          <tr id="user-row-${userId}">
            <td>${userId}</td>
            <td>${userData.fullName}</td>
            <td>${userData.email}</td>
            <td>${userData.phoneNumber}</td>
            <td>
                <button class="btn view-records" onclick="viewRecords('${userId}')">View All Records</button>
            </td>
          </tr>
      `;
  });
}


// Ensure DOM is fully loaded before setting up event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Event listener for the sort order dropdown
  const sortOrderDropdown = document.getElementById('sortOrder');
  if (sortOrderDropdown) {
      sortOrderDropdown.addEventListener('change', () => {
          displayRecords(currentRecords, sortOrderDropdown.value);
      });
  } else {
      console.error('Sort order dropdown not found.');
  }

  // Event listener for the modal close button
  const closeModalButton = document.querySelector('.close');
  const recordsModal = document.getElementById('recordsModal');

  if (closeModalButton) {
      closeModalButton.addEventListener('click', () => {
          recordsModal.style.display = 'none';
      });
  } else {
      console.error('Close button not found.');
  }

  // Close modal when clicking outside of the modal content
  window.addEventListener('click', (event) => {
      if (event.target === recordsModal) {
          recordsModal.style.display = 'none';
      }
  });
});

// Update Email Functionality
export function updateEmail() {
    const newEmail = document.getElementById('newEmailInput').value;
    if (newEmail) {
        // Implement email update logic with verification here
        alert(`Verification email sent to ${newEmail}. Please verify to update.`);
    } else {
        alert('Please enter a valid email.');
    }
}

// Delete Admin Account
export function deleteAdminAccount() {
    if (confirm('Are you sure you want to delete your admin account?')) {
        // Implement account deletion logic here
        alert('Admin account deleted successfully.');
        logout();
    }
}

// Event Listeners
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('updateEmailBtn').addEventListener('click', () => {
    document.getElementById('updateEmailModal').style.display = 'block';
});
document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    document.getElementById('deleteAccountModal').style.display = 'block';
});
document.getElementById('verifyEmailBtn').addEventListener('click', updateEmail);
document.getElementById('confirmDeleteBtn').addEventListener('click', deleteAdminAccount);
document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    });
});

const adminFullName = document.getElementById('adminFullName');

// Load Admin Info
loadAdminInfo();

async function loadAdminInfo() {
    // Retrieve the admin's email from sessionStorage or localStorage
    const adminEmail = sessionStorage.getItem('adminEmail') || localStorage.getItem('adminEmail');
    
    // If no admin email found, redirect to login page
    if (!adminEmail) {
        window.location.href = './admin_login.html';
        return;
    }

    try {
        // Reference to the 'admins' node in Firebase
        const usersRef = ref(db, 'admins');
        
        // Fetch the data from Firebase
        const snapshot = await get(usersRef);
        
        // Check if data exists
        if (snapshot.exists()) {
            const admins = snapshot.val();
            
            // Find the admin by email
            const adminData = Object.values(admins).find(admin => admin.email === adminEmail);
            
            // If admin data and full name exist, display it
            if (adminData && adminData.fullName) {
                adminFullName.textContent = adminData.fullName;
            }
        }
    } catch (error) {
        console.error('Error fetching admin info:', error);
    }
}