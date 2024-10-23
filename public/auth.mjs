import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth } from './app.mjs';

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