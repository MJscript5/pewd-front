// dashb.mjs

// Function to handle logout
export function logout() {
    // Clear session-related data (if using sessionStorage or localStorage)
    sessionStorage.clear();  // Clear the session storage
    localStorage.removeItem('authToken');  // Remove auth token from localStorage (if used)

    // Redirect the user to the login page
    window.location.href = 'login.html';
}
