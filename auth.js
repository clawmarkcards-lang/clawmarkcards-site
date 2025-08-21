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

// Signup form handler
document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return db.collection("users").doc(user.uid).set({
        email: user.email,
        createdAt: new Date().toISOString()
      });
    })
    .then(() => {
      alert("Signup successful! Welcome to the Claw Mark.");
      document.getElementById("signup-form").reset();
    })
    .catch((error) => {
      console.error("Signup error:", error);
      alert("Error: " + error.message);
    });
});
