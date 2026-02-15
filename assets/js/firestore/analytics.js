// /assets/js/firestore/analytics.js
// Firestore helpers for analytics collection
// Firebase v9 modular API

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { db } from "../../../firebase/firebase-config.js";

const analyticsRef = collection(db, "analytics");

/**
 * Get all analytics records
 */
export async function getAllAnalytics() {
  try {
    const snapshot = await getDocs(analyticsRef);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("getAllAnalytics error:", error);
    return [];
  }
}

/**
 * Get analytics for a specific page
 */
export async function getPageAnalytics(pageName) {
  if (!pageName) return null;

  try {
    const docSnap = await getDoc(doc(db, "analytics", pageName));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("getPageAnalytics error:", error);
    return null;
  }
}

/**
 * Record page view (increments view count)
 */
export async function recordPageView(pageName) {
  if (!pageName) return false;

  try {
    const docRef = doc(db, "analytics", pageName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Increment existing
      await updateDoc(docRef, {
        views: (docSnap.data().views || 0) + 1,
        lastUpdated: serverTimestamp()
      });
    } else {
      // Create new
      await setDoc(docRef, {
        page: pageName,
        views: 1,
        lastUpdated: serverTimestamp()
      });
    }
    return true;
  } catch (error) {
    console.error("recordPageView error:", error);
    return false;
  }
}

/**
 * Get candidates analytics (aggregated)
 */
export async function getCandidateAnalytics() {
  try {
    const candidatesRef = collection(db, "candidates");
    const snapshot = await getDocs(candidatesRef);

    let totalCandidates = 0;
    let verifiedCount = 0;
    const partyCount = {};

    snapshot.forEach(docSnap => {
      const c = docSnap.data() || {};
      totalCandidates++;
      
      if (c.verified) verifiedCount++;

      const party = c.party || "Independent";
      partyCount[party] = (partyCount[party] || 0) + 1;
    });

    return {
      totalCandidates,
      verifiedCount,
      partyCount,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error("getCandidateAnalytics error:", error);
    return {
      totalCandidates: 0,
      verifiedCount: 0,
      partyCount: {}
    };
  }
}
