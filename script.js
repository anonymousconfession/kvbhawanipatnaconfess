// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

darkModeToggle.addEventListener('click', () => {
  body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
  darkModeToggle.textContent = body.dataset.theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', body.dataset.theme);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  body.dataset.theme = savedTheme;
  darkModeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Firebase configuration and functionality (same as before)
const firebaseConfig = {
    apiKey: "AIzaSyAisU7STb4UAJmcpuFtvp520OrX0of-THI",
    authDomain: "anonymousconfession-19707.firebaseapp.com",
    projectId: "anonymousconfession-19707",
    storageBucket: "anonymousconfession-19707.firebasestorage.app",
    messagingSenderId: "513711142017",
    appId: "1:513711142017:web:a54387faff58ba03644980",
    measurementId: "G-B7YXCGCB8Q"
  };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

auth.signInAnonymously().catch((error) => {
  console.error("Error signing in anonymously:", error);
});

const confessionForm = document.getElementById('confessionForm');
confessionForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const confessionText = document.getElementById('confessionText').value;
  db.collection('confessions').add({
    text: confessionText,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    likes: 0,
    comments: []
  }).then(() => {
    confessionForm.reset();
  }).catch((error) => {
    console.error("Error adding confession:", error);
  });
});

const confessionsDiv = document.getElementById('confessions');
db.collection('confessions').orderBy('timestamp', 'desc').onSnapshot((snapshot) => {
  confessionsDiv.innerHTML = '';
  snapshot.forEach((doc) => {
    const confession = doc.data();
    const confessionElement = document.createElement('div');
    confessionElement.classList.add('confession');
    confessionElement.innerHTML = `
      <p>${confession.text}</p>
      <div class="actions">
        <button class="like" onclick="likeConfession('${doc.id}', ${confession.likes})">Like (${confession.likes})</button>
        <button class="comment" onclick="commentOnConfession('${doc.id}')">Comment</button>
      </div>
      <div id="comments-${doc.id}"></div>
    `;
    confessionsDiv.appendChild(confessionElement);

    const commentsDiv = document.getElementById(`comments-${doc.id}`);
    confession.comments.forEach((comment) => {
      const commentElement = document.createElement('p');
      commentElement.textContent = comment;
      commentsDiv.appendChild(commentElement);
    });
  });
});

window.likeConfession = (id, currentLikes) => {
  db.collection('confessions').doc(id).update({
    likes: currentLikes + 1
  });
};

window.commentOnConfession = (id) => {
  const comment = prompt("Enter your comment:");
  if (comment) {
    db.collection('confessions').doc(id).update({
      comments: firebase.firestore.FieldValue.arrayUnion(comment)
    });
  }
};