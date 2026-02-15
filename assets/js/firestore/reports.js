// /assets/js/firestore/reports.js
// Firestore helpers for the "reports" collection
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

const reportsRef = collection(db, "reports");

/**
 * Get all reports
 */
export async function getAllReports() {
  try {
    const snapshot = await getDocs(reportsRef);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("getAllReports error:", error);
    return [];
  }
}

/**
 * Get reports for a specific candidate
 */
export async function getReportsByCandidate(candidateId) {
  if (!candidateId) return [];

  try {
    const q = query(reportsRef, where("candidateId", "==", candidateId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("getReportsByCandidate error:", error);
    return [];
  }
}

/**
 * Get reports by type (criminal, asset, performance)
 */
export async function getReportsByType(type) {
  if (!type) return [];

  try {
    const q = query(reportsRef, where("type", "==", type));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("getReportsByType error:", error);
    return [];
  }
}

/**
 * Get single report by ID
 */
export async function getReportById(reportId) {
  if (!reportId) return null;

  try {
    const docSnap = await getDoc(doc(db, "reports", reportId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("getReportById error:", error);
    return null;
  }
}

/**
 * Create new report (admin only)
 */
export async function createReport(data) {
  if (!data || !data.candidateId) {
    throw new Error("candidateId is required");
  }

  try {
    const docRef = await addDoc(reportsRef, {
      candidateId: data.candidateId,
      type: data.type || "criminal", // criminal, asset, performance
      source: data.source || "",
      verified: data.verified || false,
      documentUrl: data.documentUrl || "",
      uploadedBy: data.uploadedBy || "",
      uploadedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("createReport error:", error);
    throw error;
  }
}

/**
 * Update report (admin only)
 */
export async function updateReport(reportId, data) {
  if (!reportId) return false;

  try {
    const updateData = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.verified !== undefined) updateData.verified = data.verified;
    if (data.documentUrl !== undefined) updateData.documentUrl = data.documentUrl;

    await updateDoc(doc(db, "reports", reportId), updateData);
    return true;
  } catch (error) {
    console.error("updateReport error:", error);
    return false;
  }
}

/**
 * Delete report (admin only)
 */
export async function deleteReport(reportId) {
  if (!reportId) return false;

  try {
    await deleteDoc(doc(db, "reports", reportId));
    return true;
  } catch (error) {
    console.error("deleteReport error:", error);
    return false;
  }
}
