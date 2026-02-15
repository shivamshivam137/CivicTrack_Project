/**
 * Admin Promises Management
 * Add, edit, delete promises linked to candidates
 */

import {
  getAllCandidates,
  getCandidateById
} from "../firestore/candidates.js";

import {
  getAllPromises,
  getPromiseById,
  createPromise,
  updatePromise,
  deletePromise
} from "../firestore/promises.js";

const form = document.getElementById("promiseForm");
const formTitle = document.getElementById("formTitle");
const candidateSelect = document.getElementById("candidateSelect");
const cancelBtn = document.getElementById("cancelEdit");
const submitBtn = document.getElementById("submitBtn");
const promisesList = document.getElementById("promisesList");

let editingId = null;
let allCandidates = [];
let allPromises = [];

/* ==========================
   Helper: Parse array input
========================== */
function parseArrayInput(input) {
  if (!input || input.trim() === "") return [];
  
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // Try line-separated
    return input
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.startsWith("http"));
  }
  
  return [];
}

/* ==========================
   Helper: Show notification
========================== */
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background-color: ${type === "success" ? "#4caf50" : "#f44336"};
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/* ==========================
   Helper: Escape HTML
========================== */
function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================
   Load candidates and populate dropdown
========================== */
async function loadCandidates() {
  try {
    allCandidates = await getAllCandidates();
    
    candidateSelect.innerHTML = '<option value="">-- Choose a candidate --</option>';
    
    allCandidates.forEach(candidate => {
      const option = document.createElement("option");
      option.value = candidate.id;
      option.textContent = `${candidate.name} (${candidate.party || "Independent"})`;
      candidateSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading candidates:", error);
    showNotification("Error loading candidates", "error");
  }
}

/* ==========================
   Load and display promises
========================== */
async function loadAndDisplayPromises() {
  try {
    allPromises = await getAllPromises();
    
    promisesList.innerHTML = "";
    
    if (allPromises.length === 0) {
      promisesList.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">No promises found. Add one to get started.</p>';
      return;
    }

    for (const promise of allPromises) {
      const candidate = allCandidates.find(c => c.id === promise.candidateId);
      const candidateName = candidate ? candidate.name : "Unknown Candidate";
      
      const card = document.createElement("div");
      card.className = "promise-card";
      
      const statusClass = `status-${promise.status || "planned"}`;
      
      card.innerHTML = `
        <div>
          <h4>
            ${escapeHtml(promise.title || "Untitled")}
            <span class="status-badge ${statusClass}">${promise.status || "planned"}</span>
          </h4>
          <p><strong>Candidate:</strong> ${escapeHtml(candidateName)}</p>
          <p><strong>Category:</strong> ${promise.category ? escapeHtml(promise.category) : "General"}</p>
          ${promise.description ? `<p><strong>Description:</strong> ${escapeHtml(promise.description)}</p>` : ""}
          <p><strong>Progress:</strong> ${promise.completionPercentage || 0}%</p>
          ${promise.proofLinks && promise.proofLinks.length > 0 ? `
            <p><strong>Proofs:</strong> ${promise.proofLinks.length} link(s)</p>
          ` : ""}
        </div>
        <div class="promise-actions">
          <button class="btn btn-primary edit-promise-btn" data-id="${promise.id}" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Edit</button>
          <button class="btn btn-danger delete-promise-btn" data-id="${promise.id}" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Delete</button>
        </div>
      `;
      
      promisesList.appendChild(card);
    }
  } catch (error) {
    console.error("Error loading promises:", error);
    showNotification("Error loading promises", "error");
  }
}

/* ==========================
   Form Submit Handler
========================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  try {
    submitBtn.disabled = true;
    submitBtn.textContent = editingId ? "Updating..." : "Saving...";
    
    const candidateId = document.getElementById("candidateSelect").value?.trim();
    const title = document.getElementById("promiseTitle").value?.trim();
    
    // Validate required fields
    if (!candidateId) {
      showNotification("Please select a candidate", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = editingId ? "Update Promise" : "Save Promise";
      return;
    }
    
    if (!title) {
      showNotification("Please enter promise title", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = editingId ? "Update Promise" : "Save Promise";
      return;
    }

    const data = {
      candidateId: candidateId,
      title: title,
      category: document.getElementById("promiseCategory").value?.trim() || "",
      description: document.getElementById("promiseDescription").value?.trim() || "",
      status: document.getElementById("promiseStatus").value || "planned",
      completionPercentage: parseInt(document.getElementById("completionPercentage").value) || 0,
      completionDate: document.getElementById("completionDate").value || null,
      proofLinks: parseArrayInput(document.getElementById("proofLinks").value)
    };

    // Validate percentage
    if (data.completionPercentage < 0 || data.completionPercentage > 100) {
      showNotification("Completion percentage must be between 0 and 100", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = editingId ? "Update Promise" : "Save Promise";
      return;
    }

    if (editingId) {
      const success = await updatePromise(editingId, data);
      if (success) {
        showNotification("Promise updated successfully!");
      } else {
        showNotification("Error updating promise", "error");
      }
    } else {
      const promiseId = await createPromise(data);
      if (promiseId) {
        showNotification("Promise created successfully!");
      }
    }

    resetForm();
    await loadAndDisplayPromises();
  } catch (error) {
    console.error("Form submission error:", error);
    showNotification("Error saving promise: " + error.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editingId ? "Update Promise" : "Save Promise";
  }
});

/* ==========================
   Edit & Delete Actions
========================== */
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("edit-promise-btn")) {
    const promiseId = e.target.dataset.id;
    const promise = await getPromiseById(promiseId);
    
    if (!promise) {
      showNotification("Promise not found", "error");
      return;
    }

    editingId = promiseId;
    formTitle.textContent = "Edit Promise";
    submitBtn.textContent = "Update Promise";
    cancelBtn.classList.remove("hidden");

    // Populate form
    document.getElementById("candidateSelect").value = promise.candidateId || "";
    document.getElementById("promiseTitle").value = promise.title || "";
    document.getElementById("promiseCategory").value = promise.category || "";
    document.getElementById("promiseDescription").value = promise.description || "";
    document.getElementById("promiseStatus").value = promise.status || "planned";
    document.getElementById("completionPercentage").value = promise.completionPercentage || 0;
    document.getElementById("completionDate").value = promise.completionDate || "";
    document.getElementById("proofLinks").value = Array.isArray(promise.proofLinks)
      ? promise.proofLinks.join("\n")
      : "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (e.target.classList.contains("delete-promise-btn")) {
    const promiseId = e.target.dataset.id;
    if (!confirm("Are you sure you want to delete this promise? This action cannot be undone.")) {
      return;
    }

    try {
      const success = await deletePromise(promiseId);
      if (success) {
        showNotification("Promise deleted successfully");
        await loadAndDisplayPromises();
      } else {
        showNotification("Error deleting promise", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("Error deleting promise", "error");
    }
  }
});

/* ==========================
   Cancel Edit Button
========================== */
cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  editingId = null;
  form.reset();
  formTitle.textContent = "Add New Promise";
  submitBtn.textContent = "Save Promise";
  cancelBtn.classList.add("hidden");
}

/* ==========================
   Initialize
========================== */
async function init() {
  await loadCandidates();
  await loadAndDisplayPromises();
}

init();
