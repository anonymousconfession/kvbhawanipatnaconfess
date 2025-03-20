// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyAisU7STb4UAJmcpuFtvp520OrX0of-THI",
    authDomain: "anonymousconfession-19707.firebaseapp.com",
    projectId: "anonymousconfession-19707",
    storageBucket: "anonymousconfession-19707.firebasestorage.app",
    messagingSenderId: "513711142017",
    appId: "1:513711142017:web:a54387faff58ba03644980",
    measurementId: "G-B7YXCGCB8Q"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Submit Confession
async function submitConfession() {
    let confessionText = document.getElementById("confessionInput").value.trim();
    if (confessionText === "") {
        alert("Please enter a confession before submitting.");
        return;
    }

    try {
        await addDoc(collection(db, "confessions"), {
            text: confessionText,
            likes: 0,
            dislikes: 0,
            comments: []
        });

        document.getElementById("confessionInput").value = "";
        loadConfessions();
    } catch (error) {
        console.error("Error adding confession:", error);
    }
}

// Load Confessions
async function loadConfessions() {
    let confessionList = document.getElementById("confessionList");
    confessionList.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "confessions"));
    querySnapshot.forEach((doc) => {
        let data = doc.data();
        let div = document.createElement("div");
        div.className = "confession-item";
        div.innerHTML = `
            <p>📝 ${data.text}</p>
            <div class="buttons">
                <button class="like-btn" onclick="likeConfession('${doc.id}', ${data.likes})">👍 ${data.likes}</button>
                <button class="dislike-btn" onclick="dislikeConfession('${doc.id}', ${data.dislikes})">👎 ${data.dislikes}</button>
            </div>
            <div class="comment-section">
                <input type="text" class="comment-input" id="comment-${doc.id}" placeholder="Add a comment...">
                <button onclick="addComment('${doc.id}')">💬 Comment</button>
                <div class="comment-list" id="commentList-${doc.id}">
                    ${data.comments.map(comment => `<p>🗨️ ${comment}</p>`).join("")}
                </div>
            </div>
        `;
        confessionList.appendChild(div);
    });
}

// Like & Dislike
async function likeConfession(id, likes) {
    const confessionRef = doc(db, "confessions", id);
    await updateDoc(confessionRef, { likes: likes + 1 });
    loadConfessions();
}

async function dislikeConfession(id, dislikes) {
    const confessionRef = doc(db, "confessions", id);
    await updateDoc(confessionRef, { dislikes: dislikes + 1 });
    loadConfessions();
}

// Add Comment
async function addComment(id) {
    let commentInput = document.getElementById(`comment-${id}`).value.trim();
    if (!commentInput) return;

    const confessionRef = doc(db, "confessions", id);
    const data = (await getDoc(confessionRef)).data();
    data.comments.push(commentInput);

    await updateDoc(confessionRef, { comments: data.comments });
    loadConfessions();
}

// Dark Mode Toggle
document.getElementById("darkModeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// Load Dark Mode
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");
    loadConfessions();
});
