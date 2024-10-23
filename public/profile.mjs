import { auth, db } from './app.mjs';
import { ref, get, update, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { RecaptchaVerifier, signInWithPhoneNumber, sendEmailVerification, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { checkAuth, redirectToLogin } from './auth.mjs';

let currentUser = null;
let isEditing = false;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const user = await checkAuth();
    currentUser = user;
    await fetchUserData(user.uid);
    setupRecaptcha();
    setupEventListeners();
  } catch (error) {
      console.error("User not logged in:", error);
      redirectToLogin();
  }
});

async function fetchUserData(userId) {
  const userRef = ref(db, `users/${userId}`);
  try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
          updateProfileUI(snapshot.val());
      } else {
          console.error('User data not found');
          redirectToLogin();
      }
  } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Failed to load user data. Please try again later.");
  }
}

function updateProfileUI(userData) {
  document.getElementById('username').textContent = userData.username;
  document.getElementById('user-id').textContent = currentUser.uid;
  document.getElementById('user-email').textContent = userData.email;
  document.getElementById('phone-number').value = userData.phone || '';
  document.getElementById('birthday').value = userData.birthday || '';

  updateVerificationStatus('email', userData.emailVerified);
  updateVerificationStatus('phone', userData.phoneVerified);

  if (userData.profilePicture) {
      document.getElementById('profile-picture').src = userData.profilePicture;
  }

  document.getElementById('verify-email').style.display = userData.emailVerified ? 'none' : 'inline-block';
  document.getElementById('verify-phone').style.display = userData.phoneVerified ? 'none' : 'inline-block';
}

function setupRecaptcha() {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'verify-phone', {
      'size': 'invisible',
      'callback': (response) => {
          startPhoneVerification();
      }
  });
}

function setupEventListeners() {
  document.getElementById('back-to-dashboard').addEventListener('click', () => window.location.href = 'dashboard.html');
  document.getElementById('copy-user-id').addEventListener('click', copyUserId);
  document.getElementById('edit-profile').addEventListener('click', toggleEditMode);
  document.getElementById('save-changes').addEventListener('click', saveChanges);
  document.getElementById('verify-phone').addEventListener('click', startPhoneVerification);
  document.getElementById('confirm-verification-code').addEventListener('click', confirmVerificationCode);
  document.getElementById('verify-email').addEventListener('click', sendVerificationEmail);
  document.getElementById('profile-picture-input').addEventListener('change', handleFileUpload);
  document.getElementById('camera-button').addEventListener('click', openCameraModal);
  document.getElementById('capture-photo').addEventListener('click', capturePhoto);
  document.getElementById('close-camera').addEventListener('click', closeCameraModal);
}

function copyUserId() {
  const userId = document.getElementById('user-id').textContent;
  navigator.clipboard.writeText(userId).then(() => {
      alert('User ID copied to clipboard!');
  }).catch(err => {
      console.error('Failed to copy: ', err);
  });
}

function toggleEditMode() {
  isEditing = !isEditing;
  document.getElementById('phone-number').disabled = !isEditing;
  document.getElementById('birthday').disabled = !isEditing;
  document.getElementById('edit-profile').style.display = isEditing ? 'none' : 'block';
  document.getElementById('save-changes').style.display = isEditing ? 'block' : 'none';
}

async function saveChanges() {
  const updatedData = {
      phone: document.getElementById('phone-number').value,
      birthday: document.getElementById('birthday').value
  };

  try {
      await update(ref(db, `users/${currentUser.uid}`), updatedData);
      alert('Profile updated successfully!');
      toggleEditMode();
  } catch (error) {
      console.error('Error updating user data:', error);
      alert('Failed to update profile. Please try again.');
  }
}

function startPhoneVerification() {
  const phoneNumber = document.getElementById('phone-number').value;
  const appVerifier = window.recaptchaVerifier;
  
  signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          document.getElementById('verification-code-container').style.display = 'block';
          alert('Verification code sent to your phone. Please enter it below.');
      }).catch((error) => {
          console.error('Error sending verification code:', error);
          alert('Failed to send verification code. Please try again.');
      });
}

function confirmVerificationCode() {
    const code = document.getElementById('verification-code').value;
    window.confirmationResult.confirm(code).then((result) => {
        update(ref(db, `users/${currentUser.uid}`), { phoneVerified: true });
        updateVerificationStatus('phone', true);
        document.getElementById('verification-code-container').style.display = 'none';
        alert('Phone number verified successfully!');
    }).catch((error) => {
        console.error('Error verifying code:', error);
        alert('Failed to verify the code. Please try again.');
    });
}

function sendVerificationEmail() {
  sendEmailVerification(currentUser).then(() => {
      alert('Verification email sent. Please check your inbox and follow the instructions.');
  }).catch((error) => {
      console.error('Error sending verification email:', error);
      alert('Failed to send verification email. Please try again.');
  });
}

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
          document.getElementById('profile-picture').src = e.target.result;
          updateProfilePicture(e.target.result);
      };
      reader.readAsDataURL(file);
  }
}
function updateProfilePicture(dataUrl) {
  update(ref(db, `users/${currentUser.uid}`), { profilePicture: dataUrl })
      .then(() => {
          console.log('Profile picture updated successfully');
      })
      .catch((error) => {
          console.error('Error updating profile picture:', error);
      });
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
  document.getElementById('profile-picture').src = dataUrl;
  updateProfilePicture(dataUrl);

  closeCameraModal();
}

function updateVerificationStatus(type, status) {
  const statusElement = document.getElementById(`${type}-verification-status`);
  statusElement.textContent = status ? `${type.charAt(0).toUpperCase() + type.slice(1)} verified` : `${type.charAt(0).toUpperCase() + type.slice(1)} not verified`;
  statusElement.style.color = status ? 'green' : 'red';
}