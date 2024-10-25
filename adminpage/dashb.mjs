// dashboard.mjs

// Data structure to store record views for each user
let userRecords = {
  1: { fullName: "John Mark Ibarra", email: "johnmark@example.com", phoneNumber: "+1234567890", recordViews: 0 },
  2: { fullName: "Sofia Smith", email: "sofiasmith@example.com", phoneNumber: "+0987654321", recordViews: 0 }
};

// Function to filter user records by user ID
export function filterByUserId() {
  const userIdInput = document.getElementById('userIdInput').value.trim();
  const rows = document.querySelectorAll('table tbody tr');

  rows.forEach(row => {
      const userId = row.querySelector('td').innerText;
      if (userIdInput && userId !== userIdInput) {
          row.style.display = 'none';
      } else {
          row.style.display = '';
      }
  });
}

// Function to view all records of a specific user by ID
export function viewAllRecords(userId) {
  if (userRecords[userId]) {
      // Increment the record view count
      userRecords[userId].recordViews += 1;

      // Update the display of record views in the table
      const recordViewsCell = document.querySelector(`tbody tr:nth-child(${userId}) td:nth-child(5)`);
      recordViewsCell.innerHTML = `${userRecords[userId].recordViews} <button class="btn-view-records" onclick="viewAllRecords(${userId})">View All Records</button>`;

      // Simulate displaying user record details (can be expanded)
      alert(`User: ${userRecords[userId].fullName}\nEmail: ${userRecords[userId].email}\nPhone: ${userRecords[userId].phoneNumber}\nRecords Viewed: ${userRecords[userId].recordViews}`);
  } else {
      alert("User not found.");
  }
}
// Function to handle logout
export function logout() {
  // Clear session-related data (if using sessionStorage or localStorage)
  sessionStorage.clear();  // Clear the session storage
  localStorage.removeItem('authToken');  // Remove auth token from localStorage (if used)

  // Redirect the user to the login page
  window.location.href = 'login.html';
}

