// dashboard.mjs

// Simulated records data - in a real app, this would come from an API
const mockPostureRecords = [
  { id: 1, userId: 1, date: '2024-01-15', postureName: 'Standing', accuracy: 95 },
  { id: 2, userId: 1, date: '2024-01-16', postureName: 'Sitting', accuracy: 88 },
  { id: 3, userId: 2, date: '2024-01-15', postureName: 'Walking', accuracy: 92 },
];

export function logout() {
  // Clear all stored authentication data
  localStorage.removeItem('authToken');
  sessionStorage.clear();
  
  // Show success message
  alert('Logged out successfully');

  // Redirect to login page
  window.location.href = './in.html';
}

export function viewRecords(userId) {
  const records = mockPostureRecords.filter(record => record.userId === parseInt(userId));
  const modal = document.getElementById('recordsModal');
  const content = document.getElementById('recordsContent');

  if (records.length > 0) {
      content.innerHTML = records.map(record => `
          <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
              <h3>${record.postureName}</h3>
              <p>Date: ${record.date}</p>
              <p>Accuracy: ${record.accuracy}%</p>
          </div>
      `).join('');
  } else {
      content.innerHTML = '<p>No records found for this user.</p>';
  }

  modal.style.display = 'block';
}