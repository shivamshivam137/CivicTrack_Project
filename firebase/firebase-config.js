// Firebase configuration and initialization (v9 modular SDK)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 🔒 Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9_dxPl_MysWCnkeqNcMD_M9XQb0bKaJg",
  authDomain: "nagrikneeti1234.firebaseapp.com",
  projectId: "nagrikneeti1234",
  storageBucket: "nagrikneeti1234.firebasestorage.app",
  messagingSenderId: "423116515556",
  appId: "1:423116515556:web:84e9d71fa067063068e4f1"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);



// const firebaseConfig = {
//   apiKey: "AIzaSyBm8QtRzAjqiXclPvg_i0rfdC3HiFWPm9E",
//   authDomain: "nagrikneeti-cfd36.firebaseapp.com",
//   projectId: "nagrikneeti-cfd36",
//   storageBucket: "nagrikneeti-cfd36.firebasestorage.app",
//   messagingSenderId: "741473011632",
//   appId: "1:741473011632:web:6243a0179b395a3902b875"
// };
