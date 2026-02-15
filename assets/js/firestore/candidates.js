// /assets/js/firestore/candidates.js
// Firestore helpers for the "candidates" collection
// Firebase v9 modular API
// NOTE: Firebase is initialized ONLY in firebase-config.js

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

const candidatesRef = collection(db, "candidates");

/**
 * Sanitize data for candidate CREATION
 * Missing fields are allowed and stored as null
 */
function sanitizeCandidateData(data = {}) {
  return {
    name: typeof data.name === "string" ? data.name : null,
    party: typeof data.party === "string" ? data.party : null,
    education: typeof data.education === "string" ? data.education : null,
    transparencyScore:
      typeof data.transparencyScore === "number" && !isNaN(data.transparencyScore)
        ? data.transparencyScore
        : null,
    promisesTotal:
      typeof data.promisesTotal === "number" && !isNaN(data.promisesTotal)
        ? data.promisesTotal
        : null,
    promisesCompleted:
      typeof data.promisesCompleted === "number" && !isNaN(data.promisesCompleted)
        ? data.promisesCompleted
        : null,
    profileImage:
      typeof data.profileImage === "string" ? data.profileImage : null,
    // Extended profile fields
    constituency: typeof data.constituency === "string" ? data.constituency : null,
    criminalCases: Array.isArray(data.criminalCases) ? data.criminalCases : [],
    assets: typeof data.assets === "object" && data.assets !== null ? data.assets : {},
    liabilities: typeof data.liabilities === "object" && data.liabilities !== null ? data.liabilities : {},
    pastPerformance: typeof data.pastPerformance === "string" ? data.pastPerformance : null,
    politicalHistory: Array.isArray(data.politicalHistory) ? data.politicalHistory : [],
    fundsAllocated: typeof data.fundsAllocated === "number" && !isNaN(data.fundsAllocated) ? data.fundsAllocated : null,
    fundsUtilized: typeof data.fundsUtilized === "number" && !isNaN(data.fundsUtilized) ? data.fundsUtilized : null
  };
}

/**
 * Sanitize data for candidate UPDATE
 * Only provided fields are included
 */
function sanitizeCandidateUpdate(data = {}) {
  const cleaned = {};

  if (typeof data.name === "string") cleaned.name = data.name;
  if (typeof data.party === "string") cleaned.party = data.party;
  if (typeof data.education === "string") cleaned.education = data.education;
  if (typeof data.constituency === "string") cleaned.constituency = data.constituency;

  if (typeof data.transparencyScore === "number" && !isNaN(data.transparencyScore)) {
    cleaned.transparencyScore = data.transparencyScore;
  }

  if (typeof data.promisesTotal === "number" && !isNaN(data.promisesTotal)) {
    cleaned.promisesTotal = data.promisesTotal;
  }

  if (typeof data.promisesCompleted === "number" && !isNaN(data.promisesCompleted)) {
    cleaned.promisesCompleted = data.promisesCompleted;
  }

  if (typeof data.profileImage === "string") {
    cleaned.profileImage = data.profileImage;
  }

  if (typeof data.pastPerformance === "string") {
    cleaned.pastPerformance = data.pastPerformance;
  }

  if (Array.isArray(data.criminalCases)) {
    cleaned.criminalCases = data.criminalCases;
  }

  if (typeof data.assets === "object" && data.assets !== null) {
    cleaned.assets = data.assets;
  }

  if (typeof data.liabilities === "object" && data.liabilities !== null) {
    cleaned.liabilities = data.liabilities;
  }

  if (Array.isArray(data.politicalHistory)) {
    cleaned.politicalHistory = data.politicalHistory;
  }

  if (typeof data.fundsAllocated === "number" && !isNaN(data.fundsAllocated)) {
    cleaned.fundsAllocated = data.fundsAllocated;
  }

  if (typeof data.fundsUtilized === "number" && !isNaN(data.fundsUtilized)) {
    cleaned.fundsUtilized = data.fundsUtilized;
  }

  return cleaned;
}

/**
 * Get all candidates
 */
export async function getAllCandidates() {
  try {
    const snapshot = await getDocs(candidatesRef);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("getAllCandidates error:", error);
    return [];
  }
}

/**
 * Get a single candidate by ID
 */
export async function getCandidateById(id) {
  if (!id) return null;

  try {
    const ref = doc(db, "candidates", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error("getCandidateById error:", error);
    return null;
  }
}

/**
 * Create a new candidate
 */
export async function createCandidate(data = {}) {
  try {
    const payload = {
      ...sanitizeCandidateData(data),
      createdAt: serverTimestamp()
    };

    await addDoc(candidatesRef, payload);
  } catch (error) {
    console.error("createCandidate error:", error);
  }
}

/**
 * Update an existing candidate (SAFE PARTIAL UPDATE)
 */
export async function updateCandidate(id, data = {}) {
  if (!id || !data || Object.keys(data).length === 0) return;

  const payload = sanitizeCandidateUpdate(data);
  if (Object.keys(payload).length === 0) return;

  try {
    const ref = doc(db, "candidates", id);
    await updateDoc(ref, payload);
  } catch (error) {
    console.error("updateCandidate error:", error);
  }
}

/**
 * Delete a candidate
 */
export async function deleteCandidate(id) {
  if (!id) return;

  try {
    const ref = doc(db, "candidates", id);
    await deleteDoc(ref);
  } catch (error) {
    console.error("deleteCandidate error:", error);
  }
}
/**
 * Get candidates by constituency
 */
export async function getCandidatesByConstituency(constituency) {
  if (!constituency) return [];

  try {
    const q = query(candidatesRef, where("constituency", "==", constituency));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("getCandidatesByConstituency error:", error);
    return [];
  }
}

/**
 * Get unique list of all constituencies
 */
export async function getAllConstituencies() {
  try {
    const snapshot = await getDocs(candidatesRef);
    const constituencies = new Set();
    
    snapshot.docs.forEach(docSnap => {
      const c = docSnap.data();
      if (c.constituency && typeof c.constituency === "string") {
        constituencies.add(c.constituency);
      }
    });

    return Array.from(constituencies).sort();
  } catch (error) {
    console.error("getAllConstituencies error:", error);
    return [];
  }
}

/**
 * Calculate promise fulfillment percentage for a candidate
 */
export function calculateFulfillmentPercentage(candidate = {}) {
  const total = candidate.promisesTotal ?? 0;
  const completed = candidate.promisesCompleted ?? 0;

  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Calculate fund utilization percentage
 */
export function calculateFundUtilization(candidate = {}) {
  const allocated = candidate.fundsAllocated ?? 0;
  const utilized = candidate.fundsUtilized ?? 0;

  if (allocated === 0) return 0;
  return Math.round((utilized / allocated) * 100);
}