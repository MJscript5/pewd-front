import { db } from './app.mjs';
import { ref, onValue, get, set, push, remove } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { fetchLinkMetadata, convertLinksWithMetadata } from './util.mjs';

// Redirect to login if the admin is not logged in
if (!sessionStorage.getItem('adminEmail') && !localStorage.getItem('adminEmail')) {
  window.location.href = './admin_login.html';
}


// In-memory variable to store currently displayed records
let currentRecords = [];

export function logout() {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    window.location.href = './admin_login.html';
}



// Function to save user data (including user ID) in Firebase and localStorage
function saveUserData(userId, userData) {
    const existingUsers = JSON.parse(localStorage.getItem('searchedUsers')) || {};
  
    // Check if the user data is already stored
    if (existingUsers[userId]) {
      console.log(`User ${userId} is already saved. Skipping duplicate.`);
      return;
    }
  
    // Save new user data to localStorage
    existingUsers[userId] = userData;
    localStorage.setItem('searchedUsers', JSON.stringify(existingUsers));
  
    // Retrieve the admin's Firebase UID from the authentication session
    const adminUid = sessionStorage.getItem('adminUid') || localStorage.getItem('adminUid');
  
    if (adminUid) {
      // Use Firebase to store multiple User IDs under the admin's node
      const adminUserIdsRef = ref(db, `admins/${adminUid}/userIds`);
  
      // Retrieve the current list of userIds to avoid overwriting
      get(adminUserIdsRef)
        .then((snapshot) => {
          let userIds = snapshot.exists() ? snapshot.val() : {};
  
          // Add the new userId to the list
          userIds[userId] = true; // Use a unique key-value pair to prevent duplicates
  
          // Update the list in Firebase
          set(adminUserIdsRef, userIds)
            .then(() => {
              console.log('User ID saved successfully in Firebase under admin UID:', adminUid);
            })
            .catch((error) => {
              console.error('Error saving User ID in Firebase:', error);
            });
        })
        .catch((error) => {
          console.error('Error retrieving existing User IDs:', error);
        });
    } else {
      console.error('Admin UID not found. Cannot save User ID.');
    }
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
  
        // Save user data in localStorage and Firebase
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
            <td>
                <button class="btn comment-btn" onclick="openCommentModal('${userId}')">Comments</button>
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
    const adminUid = sessionStorage.getItem('adminUid') || localStorage.getItem('adminUid');
  
    if (adminUid) {
      // Retrieve the saved user ID from Firebase for the current admin
      const adminRef = ref(db, `admins/${adminUid}userId`);
  
      onValue(adminRef, (snapshot) => {
        if (snapshot.exists()) {
          const adminData = snapshot.val();
  
          if (adminData.userId) {
            // Populate the textbox with the last used user ID
            document.getElementById('userIdInput').value = adminData.userId;
  
            // Optionally, fetch the user data automatically if the user ID exists
            fetchUserRecords(adminData.userId);
          }
        } else {
          console.log('No data found for the current admin.');
        }
      });
    } else {
      console.error('Admin UID not found. Cannot load stored user data.');
    }
  
    // Loop through stored users in localStorage and append them to the table
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
          <td>
            <button class="btn comment-btn" onclick="openCommentModal('${userId}')">Comments</button>
         </td>
        </tr>
      `;
    });
  }
  

  // Fetch records for a specific user based on User ID input
document.getElementById('fetchRecordsBtn').addEventListener('click', () => {
    const userId = document.getElementById('userIdInput').value;
    if (userId) {
      // Save the User ID in Firebase and localStorage
      const adminEmail = sessionStorage.getItem('adminEmail') || localStorage.getItem('adminEmail');
      const adminsRef = ref(db, `admins`);
      onValue(adminsRef, (snapshot) => {
        if (snapshot.exists()) {
          const admins = snapshot.val();
          const adminData = Object.values(admins).find(admin => admin.email === adminEmail);
  
          if (adminData) {
            const adminId = adminData.id;
            set(ref(db, `admins/${adminId}/userId`), userId);  // Save User ID under admin
          }
        }
      });
  
      fetchUserRecords(userId);
    } else {
      alert('Please enter a valid User ID.');
    }
  });
  
  


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

// Function to archive the admin account directly
export function archiveAdminAccount() {
    const adminEmail = sessionStorage.getItem('adminEmail') || localStorage.getItem('adminEmail');
    const adminRef = ref(db, `admins`);
    const archivedAdminsRef = ref(db, `archivedAdmins`);

    // Find the admin ID in the active admin list based on email
    onValue(adminRef, (snapshot) => {
        if (snapshot.exists()) {
            const admins = snapshot.val();
            const adminData = Object.values(admins).find(admin => admin.email === adminEmail);

            if (adminData) {
                const adminId = adminData.id;  // Assuming each admin has a unique id

                // Archive the admin data
                set(ref(db, `archivedAdmins/${adminId}`), adminData)
                    .then(() => {
                        // Remove the admin from the active admins section
                        remove(ref(db, `admins/${adminId}`))
                            .then(() => {
                                alert('Your admin account has been archived successfully.');
                                logout();  // Log the admin out
                            })
                            .catch((error) => {
                                console.error('Error removing admin from active list:', error);
                                alert('Failed to archive the account.');
                            });
                    })
                    .catch((error) => {
                        console.error('Error archiving admin data:', error);
                        alert('Failed to archive the account.');
                    });
            }
        }
    });
}

// Event Listeners
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('updateEmailBtn').addEventListener('click', () => {
    document.getElementById('updateEmailModal').style.display = 'block';
});
// Close modal when clicking on the close button or outside the modal
document.querySelectorAll('.close').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach((modal) => {
            modal.style.display = 'none';
        });
    });
});

// Event listener for the archive account button to open the modal
document.getElementById('archiveAccountBtn').addEventListener('click', () => {
    document.getElementById('archiveAccountModal').style.display = 'block';
});

document.getElementById('verifyEmailBtn').addEventListener('click', updateEmail);
// document.getElementById('confirmArchiveBtn').addEventListener('click', archiveAdminAccount);
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

                // Store fullName in sessionStorage for easier access
                sessionStorage.setItem('adminFullName', adminData.fullName);
            }
        }

        // Load stored user data
        loadStoredUserData();
    } catch (error) {
        console.error('Error fetching admin info:', error);
    }
}

let currentUserId = null;

// Function to open the comment modal and fetch existing comments
function openCommentModal(userId) {
    currentUserId = userId; // Save the user ID for comment operations
    const commentModal = document.getElementById('commentModal');
    commentModal.style.display = 'block';
    displayComments(userId); // Fetch and display existing comments
}

// Function to close the comment modal
function closeCommentModal() {
    const commentModal = document.getElementById('commentModal');
    commentModal.style.display = 'none';
    document.getElementById('commentInput').value = ''; // Clear input box
}

// Function to add a comment to a user's record (with link metadata)
async function addComment() {
    const content = document.getElementById('commentInput').value;
    const fullName = sessionStorage.getItem('adminFullName');  // Fetch admin full name

    if (content && currentUserId && fullName) {
        const commentsRef = ref(db, `users/${currentUserId}/comments`);
        const newCommentRef = push(commentsRef); 
        const timestamp = new Date().toISOString();

        // Convert links in the comment to metadata before saving
        const contentWithLinks = await convertLinksWithMetadata(content);

        try {
            await set(newCommentRef, {
                content: contentWithLinks, // Use the converted content with embedded links
                timestamp: timestamp,
                uploader: fullName  // Save the uploader's full name
            });
            alert('Comment added successfully.');
            document.getElementById('commentInput').value = ''; 
            displayComments(currentUserId); // Refresh the comment list
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    } else {
        alert('Please enter a comment.');
    }
}



// Function to delete a comment
async function deleteComment(commentId) {
    if (currentUserId && commentId) {
        const commentRef = ref(db, `users/${currentUserId}/comments/${commentId}`);
        try {
            await remove(commentRef); 
            alert('Comment deleted successfully.');
            displayComments(currentUserId);
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    }
}

// Function to display comments for a user's records
async function displayComments(userId) {
    const commentsRef = ref(db, `users/${userId}/comments`);
    const commentList = document.getElementById('commentList');

    try {
        const snapshot = await get(commentsRef);
        if (snapshot.exists()) {
            const comments = snapshot.val();
            commentList.innerHTML = Object.entries(comments).map(([id, comment]) => {
                const uploader = comment.uploader || 'Anonymous';  // Use 'Anonymous' if no uploader info

                return `
                    <div class="comment-item">
                        <div class="comment-content">
                            <strong>${uploader}:</strong> ${comment.content}
                        </div>
                        <button class="delete-btn" onclick="deleteComment('${id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <small>${new Date(comment.timestamp).toLocaleString()}</small>
                    </div>
                `;
            }).join('');
        } else {
            commentList.innerHTML = '<p>No comments available for this user.</p>';
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
        commentList.innerHTML = '<p>Error loading comments.</p>';
    }
}




// Event listener to close the modal
document.querySelectorAll('.close').forEach((btn) => {
    btn.addEventListener('click', closeCommentModal);
});

// Add comment button event listener
document.getElementById('addCommentBtn').addEventListener('click', addComment);

// Export functions to the global scope
window.openCommentModal = openCommentModal;
window.displayComments = displayComments;
window.addComment = addComment;
window.deleteComment = deleteComment; // Export the delete function to be accessible globally
