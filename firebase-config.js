// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);