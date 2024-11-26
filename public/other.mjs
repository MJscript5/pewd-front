import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { db } from './app.mjs';  
import { checkAuth, redirectToLogin } from "./auth.mjs";
import { fetchLinkMetadata, convertLinksWithMetadata } from "./util.mjs";


async function fetchAndDisplayComments(userId) {
    const commentsRef = ref(db, `users/${userId}/comments`);
    const commentList = document.getElementById('commentList');

    try {
        const snapshot = await get(commentsRef);
        if (snapshot.exists()) {
            const comments = snapshot.val();
            commentList.innerHTML = Object.entries(comments).map(([id, comment]) => `
                <div class="comment-item">
                    <p>${comment.content}</p>
                    <small>${new Date(comment.timestamp).toLocaleString()}</small>
                </div>
            `).join('');
        } else {
            commentList.innerHTML = '<p>No comments available for this user.</p>';
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
        commentList.innerHTML = '<p>Error loading comments.</p>';
    }
}



document.addEventListener('DOMContentLoaded', async () => {
    try {
        await checkAuth();
        const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');

        // Debug: Log the retrieved userId
        console.log('Retrieved userId:', userId);

        if (userId) {
            fetchAndDisplayComments(userId);
        } else {
            console.error('User ID not found. Cannot fetch comments.');
        }
    } catch (error) {
        console.error("User not logged in:", error);
        redirectToLogin();
    }
});

