// ===============================
// Firebase Auth (Register + Login)
// ===============================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { auth, db } from "../../firebase/firebase-config.js";

/* ===============================
   REGISTER LOGIC
================================ */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  const errorEl = document.getElementById("error");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorEl.textContent = "";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        name,
        email,
        role: "user",
        isActive: true,
        createdAt: serverTimestamp()
      });

      window.location.href = "login.html";

    } catch (error) {
      errorEl.textContent = error.message;
    }
  });
}

/* ===============================
   LOGIN + ROLE REDIRECT
================================ */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const errorBox = document.getElementById("loginError");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        throw new Error("User record not found.");
      }

      const { role } = userDoc.data();

      if (role === "admin") {
        window.location.href = "../admin/admin-dashboard.html";
      } else {
        window.location.href = "dashboard.html";
      }

    } catch (error) {
      errorBox.textContent = error.message;
      console.error("Login error:", error);
    }
  });
}

/* ===============================
   GLOBAL AUTH STATE LISTENER
   (Session consistency only)
================================ */

onAuthStateChanged(auth, (user) => {
  // Route protection handled by role-guard.js
  if (user) {
    console.log("User session active:", user.uid);
  } else {
    console.log("No active session");
  }
});
