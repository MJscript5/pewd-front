import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth, db, transferTempRecords } from './app.mjs';
import { ref, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

export function checkAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) { // User is signed in
        resolve(user);
      } else { // User is signed out
        reject("No user logged in");
      }
    });
  });
}

export function redirectToLogin() {
  window.location.href = 'index.html';
}

export function redirectToDashboard() {
  window.location.href = 'dashboard.html';
}

// Function to sign up a new user using Firebase Authentication
export async function signUpUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User signed up:', user);
    await transferTempRecords(user.uid);
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw new Error(error.message);
  }
}

// Function to sign in a user using Firebase Authentication
export async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User signed in:', user);
    await transferTempRecords(user.uid);
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw new Error(error.message);
  }
}

// Function to sign out a user using Firebase Authentication
export async function signOutUser() {
  try {
    await signOut(auth);
    console.log('User signed out.');
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error(error.message);
  }
}

// Function to delete a user account and their data
export async function deleteUserAccount() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      // Delete user data from the database
      await remove(ref(db, `users/${user.uid}`));

      // Delete the user's authentication account
      await deleteUser(user);

      console.log("User account and data deleted successfully");
      // Redirect to login page or show a message
      redirectToLogin();
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw error;
    }
  } else {
    console.error("No user is currently signed in");
    throw new Error("No user is currently signed in");
  }
}