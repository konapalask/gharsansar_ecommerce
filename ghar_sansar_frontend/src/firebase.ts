// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSo3xPFLHDgitLPvkioDJbB56s_sMx38I",
  authDomain: "gharsansar-3c8e3.firebaseapp.com",
  projectId: "gharsansar-3c8e3",
  storageBucket: "gharsansar-3c8e3.firebasestorage.app",
  messagingSenderId: "102329733113",
  appId: "1:102329733113:web:a8d0d6e6afd78a37a1b728",
  measurementId: "G-QR7GW3LLTY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };
