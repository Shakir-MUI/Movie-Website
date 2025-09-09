// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHmPBEHPxcIJrBjbLhO_ceCtUYNiJRinU",
  authDomain: "movie-website-8d83e.firebaseapp.com",
  databaseURL: "https://movie-website-8d83e-default-rtdb.firebaseio.com",
  projectId: "movie-website-8d83e",
  storageBucket: "movie-website-8d83e.firebasestorage.app",
  messagingSenderId: "537157395901",
  appId: "1:537157395901:web:e54537d7c7158f27f95ed4",
  measurementId: "G-WY10FYFZVG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Realtime Database
const database = getDatabase(app);

// Export the initialized services
export { app, analytics, auth, database };
