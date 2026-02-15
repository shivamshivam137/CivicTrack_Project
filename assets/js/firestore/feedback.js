// /assets/js/firestore/feedback.js
// Firestore helpers for the "feedback" collection
// Verified feedback on candidates (users must be authenticated to submit)
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
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { db } from "../../../firebase/firebase-config.js";

const feedbackRef = collection(db, "feedback");

/**
 * Get all feedback (public read)
 */
export async function getAllFeedback() {
  try {
    const q = query(feedbackRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("getAllFeedback error:", error);
    return [];
  }
}

/**
 * Get feedback for a specific candidate (public read)
 */
export async function getFeedbackByCandidate(candidateId) {
  if (!candidateId) return [];

  try {
    const q = query(
      feedbackRef,
      where("candidateId", "==", candidateId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("getFeedbackByCandidate error:", error);
    return [];
  }
}

/**
 * Get user's feedback for a specific candidate
 */
export async function getUserFeedbackForCandidate(candidateId, userId) {
  if (!candidateId || !userId) return null;

  try {
    const q = query(
      feedbackRef,
      where("candidateId", "==", candidateId),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("getUserFeedbackForCandidate error:", error);
    return null;
  }
}

/**
 * Create new feedback (must be authenticated)
 */
export async function createFeedback(data) {
  if (!data || !data.candidateId || !data.userId || !data.userName) {
    throw new Error("candidateId, userId, and userName are required");
  }

  try {
    // Sanitize feedback text to prevent XSS
    const feedbackText = typeof data.feedbackText === "string" ? data.feedbackText.trim() : "";
    if (feedbackText.length === 0) {
      throw new Error("Feedback text cannot be empty");
    }

    if (feedbackText.length > 5000) {
      throw new Error("Feedback text cannot exceed 5000 characters");
    }

    const rating = typeof data.rating === "number" ? Math.max(1, Math.min(5, Math.round(data.rating))) : 3;

    const docRef = await addDoc(feedbackRef, {
      candidateId: data.candidateId,
      userId: data.userId,
      userName: typeof data.userName === "string" ? data.userName : "Anonymous",
      feedbackText: feedbackText,
      rating: rating,
      verified: true, // marked as verified since user is authenticated
      isPositive: data.isPositive === true || data.isPositive === false ? data.isPositive : null,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("createFeedback error:", error);
    throw error;
  }
}

/**
 * Update feedback (user or admin only)
 */
export async function updateFeedback(feedbackId, data) {
  if (!feedbackId) return false;

  try {
    const updateData = {};
    
    if (data.feedbackText !== undefined) {
      const text = typeof data.feedbackText === "string" ? data.feedbackText.trim() : "";
      if (text.length > 0 && text.length <= 5000) {
        updateData.feedbackText = text;
      }
    }

    if (data.rating !== undefined) {
      updateData.rating = Math.max(1, Math.min(5, Math.round(data.rating)));
    }

    if (data.isPositive !== undefined) {
      updateData.isPositive = data.isPositive;
    }

    if (Object.keys(updateData).length === 0) return false;

    updateData.lastUpdated = serverTimestamp();
    await updateDoc(doc(db, "feedback", feedbackId), updateData);
    return true;
  } catch (error) {
    console.error("updateFeedback error:", error);
    return false;
  }
}

/**
 * Delete feedback (user or admin only)
 */
export async function deleteFeedback(feedbackId) {
  if (!feedbackId) return false;

  try {
    await deleteDoc(doc(db, "feedback", feedbackId));
    return true;
  } catch (error) {
    console.error("deleteFeedback error:", error);
    return false;
  }
}

/**
 * Calculate average rating for a candidate
 */
export async function getCandidateAverageRating(candidateId) {
  if (!candidateId) return 0;

  try {
    const feedbacks = await getFeedbackByCandidate(candidateId);
    if (feedbacks.length === 0) return 0;

    const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 3), 0);
    return Math.round((sum / feedbacks.length) * 10) / 10;
  } catch (error) {
    console.error("getCandidateAverageRating error:", error);
    return 0;
  }
}

/**
 * Get feedback summary for a candidate
 */
export async function getCandidateFeedbackSummary(candidateId) {
  if (!candidateId) return { totalFeedback: 0, averageRating: 0, positiveCount: 0, negativeCount: 0 };

  try {
    const feedbacks = await getFeedbackByCandidate(candidateId);
    if (feedbacks.length === 0) {
      return { totalFeedback: 0, averageRating: 0, positiveCount: 0, negativeCount: 0 };
    }

    const averageRating = Math.round((feedbacks.reduce((acc, f) => acc + (f.rating || 3), 0) / feedbacks.length) * 10) / 10;
    const positiveCount = feedbacks.filter(f => f.isPositive === true).length;
    const negativeCount = feedbacks.filter(f => f.isPositive === false).length;

    return {
      totalFeedback: feedbacks.length,
      averageRating: averageRating,
      positiveCount: positiveCount,
      negativeCount: negativeCount
    };
  } catch (error) {
    console.error("getCandidateFeedbackSummary error:", error);
    return { totalFeedback: 0, averageRating: 0, positiveCount: 0, negativeCount: 0 };
  }
}
