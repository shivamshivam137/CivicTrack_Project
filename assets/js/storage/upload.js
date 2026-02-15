// /assets/js/storage/upload.js
// Firebase Storage helpers for image and document uploads
// Firebase v9 modular API

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

import { app } from "../../firebase/firebase-config.js";

const storage = getStorage(app);

/**
 * Upload candidate image to Storage
 * Returns download URL on success
 */
export async function uploadCandidateImage(file) {
  if (!file) {
    throw new Error("File is required");
  }

  try {
    const timestamp = Date.now();
    const fileName = `candidates/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("uploadCandidateImage error:", error);
    throw error;
  }
}

/**
 * Upload document (report, verification, etc.)
 * Returns download URL on success
 */
export async function uploadDocument(file, folder = "documents") {
  if (!file) {
    throw new Error("File is required");
  }

  try {
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("uploadDocument error:", error);
    throw error;
  }
}

/**
 * Delete file from Storage
 */
export async function deleteFile(fileUrl) {
  if (!fileUrl) return false;

  try {
    // Extract path from URL - Firebase URLs contain encoded paths
    // This is simplified; in production may need more robust parsing
    console.log("File deletion requires path, not URL. Use direct refs if needed.");
    return false;
  } catch (error) {
    console.error("deleteFile error:", error);
    return false;
  }
}