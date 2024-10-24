// Simulated user data (in a real application, this would come from a database)
const users = [
    { id: 1, name: "John Mark", email: "johnmark@example.com", phone: "+1234567890", recordViews: 45 },
    { id: 2, name: "Jane Smith", email: "janesmith@example.com", phone: "+0987654321", recordViews: 30 },
    // Add more user objects as needed
  ];
  
  export function filterByUserId() {
    const userIdInput = document.getElementById('userIdInput');
    const userId = parseInt(userIdInput.value);
    
    if (isNaN(userId)) {
      console.log("Please enter a valid User ID");
      return;
    }
  
    const filteredUsers = users.filter(user => user.id === userId);
    
    if (filteredUsers.length === 0) {
      console.log(`No user found with ID ${userId}`);
    } else {
      console.log("Filtered users:", filteredUsers);
      // In a real application, you would update the table with the filtered results
      // For this example, we're just logging to the console
    }
  }
  
  export function viewAllRecords(userId) {
    const user = users.find(user => user.id === userId);
    
    if (user) {
      console.log(`Viewing all records for user ${userId}:`, user);
      // In a real application, you would fetch and display all records for this user
      // For this example, we're just logging the user object to the console
    } else {
      console.log(`No user found with ID ${userId}`);
    }
  }
  
  // For demonstration purposes, let's call these functions
  console.log("Filtering by User ID 1:");
  filterByUserId(1);
  
  console.log("\nViewing all records for User ID 2:");
  viewAllRecords(2);