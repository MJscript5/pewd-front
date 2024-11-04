// Function to handle user logout
export async function logout() {
  try {
    // Remove authentication token from localStorage and clear sessionStorage
    localStorage.removeItem('authToken');
    sessionStorage.clear();

    // Make an API call to invalidate the session on the server
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('Logout successful');
    } else {
      console.error('Failed to log out on the server.');
    }
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Redirect to the login page
    window.location.href = 'in.html';
  }
}

// Function to filter user records by user ID
export function filterByUserId() {
  const userId = document.getElementById('userIdInput').value.trim();

  if (userId === "") {
    alert("Please enter a valid User ID.");
    return;
  }

  console.log(`Filtering records for User ID: ${userId}`);
  // Implement your filtering logic here
  // For example, you could call an API to fetch filtered records
  // or filter an existing array of records
}

// Function to handle viewing all records for a particular user
export async function viewAllRecords(userId) {
  console.log(`Viewing all records for User ID: ${userId}`);

  try {
    const response = await fetch(`/api/users/${userId}/records`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('User records:', data);
      // Implement logic to display the records in your UI
    } else {
      console.error('Failed to fetch records');
    }
  } catch (error) {
    console.error('Error fetching records:', error);
  }
}