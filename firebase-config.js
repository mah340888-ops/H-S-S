// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLdWkhrahUfvDyrsGEJtZnsi_CcopvGTc",
  authDomain: "hss-web-2026.firebaseapp.com",
  projectId: "hss-web-2026",
  storageBucket: "hss-web-2026.firebasestorage.app",
  messagingSenderId: "610059714190",
  appId: "1:610059714190:web:75dd78c42eafd31dd353df",
  measurementId: "G-78MXQL09DN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.log("Firebase initialized successfully!");
