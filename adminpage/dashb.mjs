// dashb.mjs

// Function to handle user logout
export function logout() {
  try {
      // Remove authentication token from localStorage or sessionStorage
      localStorage.removeItem('authToken');
      sessionStorage.clear();

      // Optionally, make an API call to invalidate the session on the server
      /*
      fetch('/api/logout', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
          }
      }).then(response => {
          if (response.ok) {
              // Successful logout, redirect to login page
              window.location.href = './login.html';
          } else {
              console.error('Failed to log out.');
          }
      }).catch(error => {
          console.error('Error logging out:', error);
      });
      */

      // Redirect to the login page
      window.location.href = './in.html';
  } catch (error) {
      console.error('Error during logout:', error);
  }
}

// Function to filter user records by user ID
export function filterByUserId() {
  const userId = document.getElementById('userIdInput').value.trim();

  if (userId === "") {
      alert("Please enter a valid User ID.");
      return;
  }

  // Filter logic here, e.g., fetch data from an API or filter table records
  console.log(`Filtering records for User ID: ${userId}`);
  
  // Example fetch for filtered data (assuming an API exists)
  /*
  fetch(`/api/users/${userId}/records`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(data => {
      // Update the UI with filtered records
      console.log(data);
  })
  .catch(error => {
      console.error('Error fetching user records:', error);
  });
  */
}

// Function to handle viewing all records for a particular user
export function viewAllRecords(userId) {
  console.log(`Viewing all records for User ID: ${userId}`);

  // Example logic for viewing user records (assuming an API or client-side filtering)
  /*
  fetch(`/api/users/${userId}/records`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(data => {
      // Display records in the table or a modal
      console.log(data);
  })
  .catch(error => {
      console.error('Error fetching records:', error);
  });
  */
}
