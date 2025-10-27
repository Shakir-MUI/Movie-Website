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

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Authentication
const auth = getAuth(app);

// Initialize Realtime Database
const database = getDatabase(app);

console.log("🔥 Firebase initialized successfully");
console.log("🔥 Database URL:", database.app.options.databaseURL);
console.log("🔥 Auth instance:", auth ? "✅ Ready" : "❌ Failed");
console.log("🔥 Database instance:", database ? "✅ Ready" : "❌ Failed");

// Export the initialized services
export { app, analytics, auth, database };









// // Import the functions you need from the Firebase SDKs
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth } from "firebase/auth";
// import { getDatabase } from "firebase/database";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCHmPBEHPxcIJrBjbLhO_ceCtUYNiJRinU",
//   authDomain: "movie-website-8d83e.firebaseapp.com",
//   databaseURL: "https://movie-website-8d83e-default-rtdb.firebaseio.com",
//   projectId: "movie-website-8d83e",
//   storageBucket: "movie-website-8d83e.firebasestorage.app",
//   messagingSenderId: "537157395901",
//   appId: "1:537157395901:web:e54537d7c7158f27f95ed4",
//   measurementId: "G-WY10FYFZVG"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Analytics (only in browser environment)
// let analytics = null;
// if (typeof window !== 'undefined') {
//   analytics = getAnalytics(app);
// }

// // Initialize Authentication
// const auth = getAuth(app);

// // Initialize Realtime Database
// const database = getDatabase(app);

// // Test database connection
// console.log("🔥 Firebase initialized successfully");
// console.log("🔥 Database URL:", database.app.options.databaseURL);
// console.log("🔥 Auth instance:", auth ? "✅ Ready" : "❌ Failed");
// console.log("🔥 Database instance:", database ? "✅ Ready" : "❌ Failed");

// // Test write to database
// import { ref as dbRef, set as dbSet } from "firebase/database";
// const testConnection = async () => {
//   try {
//     const testRef = dbRef(database, 'connection_test');
//     await dbSet(testRef, { timestamp: Date.now(), status: 'connected' });
//     console.log("✅ Database write test successful!");
//   } catch (error) {
//     console.error("❌ Database write test failed:", error);
//   }
// };
// testConnection();

// // Export the initialized services
// export { app, analytics, auth, database };









// // Import the functions you need from the Firebase SDKs
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth } from "firebase/auth";
// import { getDatabase } from "firebase/database";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCHmPBEHPxcIJrBjbLhO_ceCtUYNiJRinU",
//   authDomain: "movie-website-8d83e.firebaseapp.com",
//   databaseURL: "https://movie-website-8d83e-default-rtdb.firebaseio.com",
//   projectId: "movie-website-8d83e",
//   storageBucket: "movie-website-8d83e.firebasestorage.app",
//   messagingSenderId: "537157395901",
//   appId: "1:537157395901:web:e54537d7c7158f27f95ed4",
//   measurementId: "G-WY10FYFZVG"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Analytics
// const analytics = getAnalytics(app);

// // Initialize Authentication
// const auth = getAuth(app);

// // Initialize Realtime Database
// const database = getDatabase(app);

// // Export the initialized services
// export { app, analytics, auth, database };
