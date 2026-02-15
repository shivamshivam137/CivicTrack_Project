// /assets/js/firestore/users.js
// Firestore helpers for the "users" collection
// Firebase v9 modular API
// NOTE: Firebase is initialized ONLY in firebase-config.js

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { db } from "../../../firebase/firebase-config.js";

/**
 * Get a user document by UID
 * @param {string} uid
 * @returns {Promise<object|null>} user data or null if not found
 */
export async function getUserById(uid) {
  if (!uid) return null;

  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return null;
    }

    return { uid: snap.id, ...snap.data() };
  } catch (error) {
    console.error("getUserById error:", error);
    return null;
  }
}

/**
 * Create a new user document
 * Should be called immediately after Firebase Auth signup
 * @param {string} uid
 * @param {object} data
 */
export async function createUser(uid, data = {}) {
  if (!uid) return;

  const payload = {
    name: data.name ?? null,
    email: data.email ?? "",
    role: data.role ?? "user",
    createdAt: serverTimestamp()
  };

  try {
    const ref = doc(db, "users", uid);
    await setDoc(ref, payload);
  } catch (error) {
    console.error("createUser error:", error);
  }
}

/**
 * Update an existing user document
 * @param {string} uid
 * @param {object} data
 */
export async function updateUser(uid, data = {}) {
  if (!uid || !data || Object.keys(data).length === 0) return;

  try {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, data);
  } catch (error) {
    console.error("updateUser error:", error);
  }
}
