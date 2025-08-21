// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCM5La0C7dKpWgQUpAxVQguDcEV1D4Vmms",
  authDomain: "clawmark-login.firebaseapp.com",
  projectId: "clawmark-login",
  storageBucket: "clawmark-login.firebasestorage.app",
  messagingSenderId: "334338665183",
  appId: "1:334338665183:web:eb179b820393234c74576a",
  measurementId: "G-JE64ZQ56T5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Signup form logic
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");

  if (!form) {
    console.warn("Signup form not found.");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const favoriteTeam = document.getElementById("favoriteTeam").value;
    const favoritePlayer = document.getElementById("favoritePlayer").value;

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Send verification email
        return user.sendEmailVerification()
          .then(() => {
            return db.collection("users").doc(user.uid).set({
              email: user.email,
              favoriteTeam: favoriteTeam,
              favoritePlayer: favoritePlayer,
              createdAt: new Date().toISOString()
            });
          });
      })
      .then(() => {
        alert("Signup successful! Check your email to verify before logging in! Please check your inbox and spam folders.");
        form.reset();
      })
      .catch((error) => {
        console.error("Signup error:", error);
        alert("Signup failed: " + error.message);
      });
  });
});
