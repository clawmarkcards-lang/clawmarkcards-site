// firebase-config.js
// Shared Firebase config for Claw Mark Cards.
// Matches the live Auth/Firestore project used by the site pages.
const firebaseConfig = {
  apiKey: "AIzaSyCM5La0C7dKpWgQUpAxVQguDcEV1D4Vmms",
  authDomain: "clawmark-login.firebaseapp.com",
  projectId: "clawmark-login",
  storageBucket: "clawmark-login.firebasestorage.app",
  messagingSenderId: "334338665183",
  appId: "1:334338665183:web:eb179b820393234c74576a",
  measurementId: "G-JE64ZQ56T5"
};

// Initialize Firebase (for compat)
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
