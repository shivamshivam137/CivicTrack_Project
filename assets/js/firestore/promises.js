// /assets/js/firestore/promises.js
// Firestore helpers for the "promises" collection
// Firebase v9 modular API

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { db } from "../../../firebase/firebase-config.js";

const promisesRef = collection(db, "promises");

/**
 * Get all promises
 */
export async function getAllPromises() {
  try {
    const snapshot = await getDocs(promisesRef);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("getAllPromises error:", error);
    return [];
  }
}

/**
 * Get promises for a specific candidate
 */
export async function getPromisesByCandidate(candidateId) {
  if (!candidateId) return [];

  try {
    const q = query(promisesRef, where("candidateId", "==", candidateId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("getPromisesByCandidate error:", error);
    return [];
  }
}

/**
 * Get single promise by ID
 */
export async function getPromiseById(promiseId) {
  if (!promiseId) return null;

  try {
    const docSnap = await getDoc(doc(db, "promises", promiseId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("getPromiseById error:", error);
    return null;
  }
}

/**
 * Create new promise (admin only)
 */
export async function createPromise(data) {
  if (!data || !data.candidateId) {
    throw new Error("candidateId is required");
  }

  try {
    const docRef = await addDoc(promisesRef, {
      candidateId: data.candidateId,
      title: data.title || "",
      description: data.description || "",
      category: data.category || "", // healthcare, education, infrastructure, etc.
      status: data.status || "planned", // planned, in-progress, completed
      completionPercentage: typeof data.completionPercentage === "number" ? Math.max(0, Math.min(100, data.completionPercentage)) : 0,
      proofLinks: Array.isArray(data.proofLinks) ? data.proofLinks : [],
      completionDate: data.completionDate || null,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("createPromise error:", error);
    throw error;
  }
}

/**
 * Update promise (admin only)
 */
export async function updatePromise(promiseId, data) {
  if (!promiseId) return false;

  try {
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.completionPercentage !== undefined) {
      updateData.completionPercentage = Math.max(0, Math.min(100, data.completionPercentage));
    }
    if (data.proofLinks !== undefined) updateData.proofLinks = data.proofLinks;
    if (data.completionDate !== undefined) updateData.completionDate = data.completionDate;
    updateData.lastUpdated = serverTimestamp();

    await updateDoc(doc(db, "promises", promiseId), updateData);
    return true;
  } catch (error) {
    console.error("updatePromise error:", error);
    return false;
  }
}

/**
 * Delete promise (admin only)
 */
export async function deletePromise(promiseId) {
  if (!promiseId) return false;

  try {
    await deleteDoc(doc(db, "promises", promiseId));
    return true;
  } catch (error) {
    console.error("deletePromise error:", error);
    return false;
  }
}
