import { auth, db } from './app.mjs';
import { ref, get, update, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, sendEmailVerification, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { checkAuth, redirectToLogin } from './auth.mjs';

let userId;
let currentUser;
let isEditing = false; // Track if we are in edit mode

const init = () => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      userId = user.uid;
      fetchUserData();
      setupEventListeners();
      setupRecaptcha();
      checkEmailVerification();
    } else {
      redirectToLogin();
    }
  });
};

const fetchUserData = async () => {
  const userRef = ref(db, `users/${userId}`);
  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      updateProfileUI(snapshot.val());
    } else {
      const newUserData = {
        username: currentUser.displayName || 'New User',
        email: currentUser.email,
        emailVerified: currentUser.emailVerified,
        phoneVerified: false,
      };
      await set(userRef, newUserData);
      updateProfileUI(newUserData);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert("Failed to load user data. Please try again later.");
  }
};

const updateProfileUI = (userData) => {
  document.getElementById('profile-name').textContent = userData.username;
  document.getElementById('profile-id').querySelector('span').textContent = userId;
  document.getElementById('profile-email').querySelector('span').textContent = userData.email;
  document.getElementById('profile-phone').value = userData.phone || '';
  document.getElementById('profile-birthday').value = userData.birthday || '';

  updateVerificationStatus('email', userData.emailVerified);
  updateVerificationStatus('phone', userData.phoneVerified);

  if (userData.profilePicture) {
    document.getElementById('profile-picture').src = userData.profilePicture;
  }
};

const setupRecaptcha = () => {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'verify-phone', {
    'size': 'invisible',
    'callback': (response) => {
      startPhoneVerification();
    }
  });
};

const setupEventListeners = () => {
  document.querySelector('.copy-button').addEventListener('click', copyUserId);
  document.getElementById('save-changes').addEventListener('click', handleSaveChanges); // Updated to handle save changes
  document.getElementById('editButton').addEventListener('click', toggleEditMode); // Add listener for edit button
  document.getElementById('verify-phone').addEventListener('click', () => startPhoneVerification());
  document.getElementById('verify-email').addEventListener('click', sendVerificationEmail);
  document.getElementById('profile-picture-input').addEventListener('change', handleFileUpload);
  document.getElementById('camera-button').addEventListener('click', openCamera);
  document.getElementById('camera-capture').addEventListener('click', capturePhoto);
  document.getElementById('camera-close').addEventListener('click', closeCamera);
};

const startPhoneVerification = async () => {
  const phoneNumber = document.getElementById('profile-phone').value.trim();
  if (!phoneNumber) {
    alert('Please enter a valid phone number.');
    return;
  }

  const verifyButton = document.getElementById('verify-phone');
  verifyButton.disabled = true;

  try {
    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;

    document.getElementById('verification-code-container').style.display = 'block';
    alert('Verification code sent to your phone. Please enter it below.');
  } catch (error) {
    console.error('Error sending verification code:', error);
    alert('Failed to send verification code. Please try again.');
  } finally {
    verifyButton.disabled = false;
  }
};

const confirmVerificationCode = async () => {
  const verificationCode = document.getElementById('verification-code').value.trim();

  if (!verificationCode) {
    alert('Please enter the verification code.');
    return;
  }

  try {
    const result = await window.confirmationResult.confirm(verificationCode);
    const user = result.user;

    const userRef = ref(db, `users/${userId}`);
    await update(userRef, { phoneVerified: true });

    updateVerificationStatus('phone', true);
    alert('Phone number verified successfully!');
    document.getElementById('verification-code-container').style.display = 'none';
  } catch (error) {
    console.error('Error verifying code:', error);
    alert('Failed to verify the code. Please try again.');
  }
};

function copyUserId() {
  const userId = document.getElementById('profile-id').querySelector('span').textContent;
  navigator.clipboard.writeText(userId).then(() => {
    alert('User ID copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

function toggleEditMode() {
  isEditing = !isEditing;

  // Toggle the disabled state of the input fields
  document.getElementById('profile-phone').disabled = !isEditing;
  document.getElementById('profile-birthday').disabled = !isEditing;

  // Toggle the visibility of the buttons
  document.getElementById('editButton').style.display = isEditing ? 'none' : 'block';
  document.getElementById('save-changes').style.display = isEditing ? 'block' : 'none';

  // Optionally, clear the verification status if editing
  if (isEditing) {
    document.querySelector('.verification-status').textContent = '';
  }
}

function handleSaveChanges() {
  const updatedData = {
    phone: document.getElementById('profile-phone').value,
    birthday: document.getElementById('profile-birthday').value
  };

  updateUserInFirebase(updatedData);
  toggleEditMode(); // Toggle back to non-edit mode
}

async function updateUserInFirebase(updatedData) {
  const userRef = ref(db, 'users/' + userId);
  try {
    await update(userRef, updatedData);
    console.log('User data updated successfully');
    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating user data:', error);
    alert('Failed to update profile. Please try again.');
  }
}

const verifyField = async (field) => {
  const value = document.getElementById(`profile-${field}`).value.trim();

  if (!value) {
    alert(`Please enter a valid ${field}.`);
    return;
  }

  if (field === 'phone') {
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, value, appVerifier);
      window.confirmationResult = confirmationResult;
      alert('Verification code sent to your phone. Please enter the code to verify.');

      document.getElementById('verification-code-container').style.display = 'block';
    } catch (error) {
      console.error('Error sending verification code:', error);
      alert('Failed to send verification code. Please try again.');
    }
  } else if (field === 'email') {
    try {
      await sendEmailVerification(currentUser);
      alert('Verification email sent. Please check your inbox and follow the instructions.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Failed to send verification email. Please try again.');
    }
  }
};

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
  const userRef = ref(db, 'users/' + userId);
  update(userRef, { profilePicture: dataUrl })
    .then(() => {
      console.log('Profile picture updated successfully');
    })
    .catch((error) => {
      console.error('Error updating profile picture:', error);
    });
}

function openCamera() {
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
    });
}

function capturePhoto() {
  const video = document.getElementById('camera-view');
  const canvas = document.getElementById('camera-canvas');
  const context = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);

  const dataUrl = canvas.toDataURL('image/png');
  document.getElementById('profile-picture').src = dataUrl;
  updateProfilePicture(dataUrl);
}

function closeCamera() {
  const modal = document.getElementById('camera-modal');
  const video = document.getElementById('camera-view');

  modal.style.display = 'none';
  const stream = video.srcObject;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
  }
}

const checkEmailVerification = () => {
  const statusElement = document.querySelector('.verification-status');
  if (!currentUser.emailVerified) {
    statusElement.textContent = 'Email not verified. Please verify your email.';
  } else {
    statusElement.textContent = 'Email verified.';
  }
};

const updateVerificationStatus = (type, status) => {
  const statusElement = document.querySelector(`.${type}-verification-status`);
  if (status) {
    statusElement.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} verified.`;
  } else {
    statusElement.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} not verified.`;
  }
};

// Initialize the script
init();
