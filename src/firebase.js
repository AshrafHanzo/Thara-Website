// Firebase Configuration for Thara's Birthday Website
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAuAW9FDEg98wJXkO-2x53GX6LxwbueQKI",
  authDomain: "thara-website.firebaseapp.com",
  projectId: "thara-website",
  storageBucket: "thara-website.firebasestorage.app",
  messagingSenderId: "956632420297",
  appId: "1:956632420297:web:00e0672c7c19612b47e218",
  measurementId: "G-JWKL6616KV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, db, analytics };
