import { db } from './app.mjs';
import { ref, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

// Simulated records data - in a real app, this would come from an API
const mockPostureRecords = [
  { id: 1, userId: 1, date: '2024-11-06', postureName: 'Good Posture'},
  { id: 2, userId: 1, date: '2024-11-05', postureName: 'Bad Posture' },
  { id: 3, userId: 2, date: '2024-11-06', postureName: 'Good Posture' },
];

export function logout() {
  localStorage.removeItem('authToken');
  sessionStorage.clear();
  // alert('Logged out successfully');
  window.location.href = './admin_login.html';
}

export function viewRecords(userId) {
  const recordsRef = ref(db, `users/${userId}/records`);
  const modal = document.getElementById('recordsModal');
  const content = document.getElementById('recordsContent');

  onValue(recordsRef, (snapshot) => {
    if (snapshot.exists()) {
        const records = snapshot.val();
        content.innerHTML = Object.values(records).map(record => `
            <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                <h3>${record.Posture}</h3>
                <p>Date: ${record.Date}</p>
                <p>Time: ${record.PhilippineTime}</p>
            </div>
        `).join('');
    } else {
        content.innerHTML = '<p>No records found for this user.</p>';
    }
    modal.style.display = 'block';
  });
}

export function fetchUserRecords(userId) {
  const usersRef = ref(db, `users/${userId}`);
  
  onValue(usersRef, (snapshot) => {
    const userTableBody = document.getElementById('userTableBody');
    if (snapshot.exists()) {
      const userData = snapshot.val();
      userTableBody.innerHTML = `
        <tr>
          <td>${userId}</td>
          <td>${userData.fullName}</td>
          <td>${userData.email}</td>
          <td>${userData.phoneNumber}</td>
          <td>
              ${userData.records ? Object.keys(userData.records).length : 0}
              <button class="btn view-records" onclick="viewRecords('${userId}')">View All Records</button>
          </td>
        </tr>
      `;
    } else {
      userTableBody.innerHTML = '<tr><td colspan="5">User not found</td></tr>';
    }
  });
}

export function loadUserStats() {
  const totalUsersRef = ref(db, 'stats/totalUsers');
  const totalRecordsRef = ref(db, 'stats/totalRecords');
  const activeAdminsRef = ref(db, 'stats/activeAdmins');

  onValue(totalUsersRef, snapshot => {
    document.getElementById('totalUsers').innerText = snapshot.val() || '0';
  });

  onValue(totalRecordsRef, snapshot => {
    document.getElementById('totalRecordsViews').innerText = snapshot.val() || '0';
  });

  onValue(activeAdminsRef, snapshot => {
    document.getElementById('activeAdmins').innerText = snapshot.val() || '0';
  });
}