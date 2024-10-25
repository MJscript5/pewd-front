import { db } from "./app.mjs";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { checkAuth, redirectToLogin } from "./auth.mjs";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

let currentUser = null;
let isEditing = false;

document.addEventListener('DOMContentLoaded', async () => {
  try {
      const user = await checkAuth();  // Use checkAuth to verify if the user is logged in
      const username = sessionStorage.getItem('username');

      if (username) {
          fetchUserData(username);  // Fetch user data based on the stored username
      } else {
          console.error('No username found in sessionStorage.');
          redirectToLogin();  // Redirect to login if no username is found
      }
  } catch (error) {
      console.error('User is not authenticated:', error);
      redirectToLogin();  // Redirect to login if no user is authenticated
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('verify-email').addEventListener('click', sendVerificationEmail);
  document.getElementById('verify-phone').addEventListener('click', startPhoneVerification);
  document.getElementById('confirm-verification-code').addEventListener('click', confirmVerificationCode);
  document.getElementById('edit-profile').addEventListener('click', toggleEditMode);
  document.getElementById('save-changes').addEventListener('click', saveChanges);
  document.getElementById('profile-picture-input').addEventListener('change', handleFileUpload);
  document.getElementById('camera-button').addEventListener('click', openCameraModal);
  document.getElementById('capture-photo').addEventListener('click', capturePhoto);
  document.getElementById('close-camera-modal').addEventListener('click', closeCameraModal);
});

async function fetchUserData(username) {
  const usersRef = ref(db, 'users');
  try {
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
          const users = snapshot.val();
          const matchedUser = Object.entries(users).find(([userId, userData]) => userData.username === username);

          if (matchedUser) {
              const [userId, userData] = matchedUser;
              sessionStorage.setItem('userId', userId);  // Store userId for further use
              populateUserProfile(userData, userId);
          } else {
              console.error('No user data found for the provided username.');
          }
      } else {
          console.error('No users found in the database.');
      }
  } catch (error) {
      console.error('Error fetching user data:', error);
  }
}

function populateUserProfile(userData, userId) {
  document.getElementById('user-id').textContent = userId;
  document.getElementById('username').textContent = userData.username;
  document.getElementById('user-email').textContent = userData.email;
  document.getElementById('phone-number').value = userData.phoneNumber || '';
  document.getElementById('birthday').value = userData.birthday || '';
  document.getElementById('profile-picture').src = userData.profilePicture || 'default-profile-picture-url';

  // Check email and phone verification statuses
  const user = auth.currentUser;  // Firebase auth current user
  checkEmailVerificationStatus(user);  // Check email verification status
  checkPhoneVerificationStatus(userData.phoneVerified);  // Check phone verification status
}

// Toggle edit/save mode
function toggleEditMode() {
  isEditing = !isEditing;
  document.getElementById('phone-number').disabled = !isEditing;
  document.getElementById('birthday').disabled = !isEditing;
  document.getElementById('edit-profile').style.display = isEditing ? 'none' : 'block';
  document.getElementById('save-changes').style.display = isEditing ? 'block' : 'none';
}

async function saveChanges() {
  const userId = sessionStorage.getItem('userId');
  const updatedData = {
      phone: document.getElementById('phone-number').value,
      birthday: document.getElementById('birthday').value
  };

  try {
      await update(ref(db, `users/${userId}`), updatedData);
      alert('Profile updated successfully!');
      toggleEditMode();  // Exit edit mode after saving
  } catch (error) {
      console.error('Error updating user data:', error);
      alert('Failed to update profile.');
  }
}

// Handle file upload for profile picture
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
      const maxSize = 2 * 1024 * 1024; // 2 MB limit
      if (file.size > maxSize) {
          alert('File size exceeds 2 MB. Please choose a smaller file.');
          return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
          document.getElementById('profile-picture').src = e.target.result;  // Display the image
          updateProfilePicture(e.target.result);  // Save image URL to Firebase
      };
      reader.readAsDataURL(file);
  }
}

async function updateProfilePicture(dataUrl) {
  const userId = sessionStorage.getItem('userId');
  if (userId) {
      await update(ref(db, `users/${userId}`), { profilePicture: dataUrl });
      console.log('Profile picture updated successfully');
  }
}

function openCameraModal() {
  const modal = document.getElementById('camera-modal');
  const video = document.getElementById('camera-view');

  modal.style.display = 'block';

  navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
          video.srcObject = stream;
          video.play();
      })
      .catch(err => {
          console.error("Error accessing camera: ", err);
          alert('Could not access the camera. Please check your permissions.');
          closeCameraModal();
      });
}

function closeCameraModal() {
  const modal = document.getElementById('camera-modal');
  const video = document.getElementById('camera-view');

  modal.style.display = 'none';

  // Stop the video stream
  const stream = video.srcObject;
  if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
  }
}

function capturePhoto() {
  const video = document.getElementById('camera-view');
  const canvas = document.getElementById('camera-canvas');
  const context = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/png');
  document.getElementById('profile-picture').src = dataUrl;  // Show captured image in the profile picture container
  updateProfilePicture(dataUrl);  // Save the captured image to Firebase

  closeCameraModal();
}

function updateVerificationStatus(type, status) {
    const statusElement = document.getElementById(`${type}-verification-status`);
    statusElement.textContent = status ? `${type.charAt(0).toUpperCase() + type.slice(1)} verified` : `${type.charAt(0).toUpperCase() + type.slice(1)} not verified`;
    statusElement.style.color = status ? 'green' : 'red';
}

// Event listeners setup
function setupEventListeners() {
    document.getElementById('back-to-dashboard').addEventListener('click', () => window.location.href = 'dashboard.html');
    document.getElementById('copy-user-id').addEventListener('click', copyUserId);
    document.getElementById('verify-email').addEventListener('click', sendVerificationEmail);
    document.getElementById('verify-phone').addEventListener('click', startPhoneVerification);
    document.getElementById('confirm-verification-code').addEventListener('click', confirmVerificationCode);
}

// Copy User ID
function copyUserId() {
    navigator.clipboard.writeText(document.getElementById('user-id').textContent).then(() => {
        alert('User ID copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Show the verify email button if the email is not verified
function checkEmailVerificationStatus(user) {
  const verifyEmailButton = document.getElementById('verify-email');
  const emailVerificationStatus = document.getElementById('email-verification-status');
  
  if (user.emailVerified) {
      emailVerificationStatus.textContent = 'Email Verified';
      emailVerificationStatus.style.color = 'green';
      verifyEmailButton.style.display = 'none';  // Hide verify button if already verified
  } else {
      emailVerificationStatus.textContent = 'Email Not Verified';
      emailVerificationStatus.style.color = 'red';
      verifyEmailButton.style.display = 'inline-block';  // Show verify button if not verified
  }
}

// Trigger email verification
function sendVerificationEmail() {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
      sendEmailVerification(user)
          .then(() => {
              alert('Verification email sent. Please check your inbox.');
          })
          .catch(error => {
              console.error('Error sending verification email:', error);
          });
  }
}

// Initialize reCAPTCHA for phone verification
window.recaptchaVerifier = new RecaptchaVerifier('verify-phone', {
  'size': 'invisible',
  'callback': (response) => {
      // reCAPTCHA solved - you can proceed with phone verification
      startPhoneVerification();
  }
});

// Show verify phone button if phone is not verified
function checkPhoneVerificationStatus(phoneVerified) {
  const verifyPhoneButton = document.getElementById('verify-phone');
  const phoneVerificationStatus = document.getElementById('phone-verification-status');

  if (phoneVerified) {
      phoneVerificationStatus.textContent = 'Phone Verified';
      phoneVerificationStatus.style.color = 'green';
      verifyPhoneButton.style.display = 'none';  // Hide verify button if already verified
  } else {
      phoneVerificationStatus.textContent = 'Phone Not Verified';
      phoneVerificationStatus.style.color = 'red';
      verifyPhoneButton.style.display = 'inline-block';  // Show verify button if not verified
  }
}

// Start phone verification process
function startPhoneVerification() {
  const phoneNumber = document.getElementById('phone-number').value;
  const appVerifier = window.recaptchaVerifier;

  signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          document.getElementById('verification-code-container').style.display = 'block';
          alert('Verification code sent to your phone.');
      })
      .catch((error) => {
          console.error('Error sending verification code:', error);
          alert('Failed to send verification code. Please try again.');
      });
}

// Confirm phone verification code
function confirmVerificationCode() {
  const code = document.getElementById('verification-code').value;
  window.confirmationResult.confirm(code)
      .then((result) => {
          alert('Phone number verified successfully!');
          // Optionally update Firebase to indicate phone is verified
          const userId = sessionStorage.getItem('userId');
          update(ref(db, `users/${userId}`), { phoneVerified: true });
          checkPhoneVerificationStatus(true);  // Update UI to show phone is verified
          document.getElementById('verification-code-container').style.display = 'none';
      })
      .catch((error) => {
          console.error('Error verifying code:', error);
          alert('Invalid verification code. Please try again.');
      });
}


