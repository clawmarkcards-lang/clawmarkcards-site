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

// Initialize Firebase (compat)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// SIGNUP form logic (+ email verification + default tier/points)
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");
  if (!form) return; // Page may not have the signup form

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const favoriteTeam = document.getElementById("favoriteTeam").value.trim();
    const favoritePlayer = document.getElementById("favoritePlayer").value.trim();

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Send verification FIRST
        return user.sendEmailVerification().then(() => {
          // Then create Firestore profile with defaults
          return db.collection("users").doc(user.uid).set({
            email: user.email,
            email_lc: user.email.toLowerCase(), // helpful for future searches
            favoriteTeam,
            favoritePlayer,
            tier: "Fresh Mark",                  // default tier
            points: 0,                           // default points
            createdAt: new Date().toISOString()  // okay for now; can switch to serverTimestamp later
          });
        });
      })
      .then(() => {
        alert("Signup successful! A verification email has been sent.\n\nPlease check your inbox and spam folder before logging in.");
        form.reset();
      })
      .catch((error) => {
        console.error("Signup error:", error);
        alert("Signup failed: " + error.message);
      });
  });
});
