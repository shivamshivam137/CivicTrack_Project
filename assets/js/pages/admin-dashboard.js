/**
 * Admin Dashboard – Candidate CRUD
 * Enhanced with full candidate profile management
 */

import { 
  getAllCandidates, 
  getCandidateById, 
  createCandidate, 
  updateCandidate, 
  deleteCandidate,
  calculateFulfillmentPercentage,
  calculateFundUtilization
} from "../firestore/candidates.js";

import { uploadImage } from "../storage/upload.js";

const form = document.getElementById("candidateForm");
const formTitle = document.getElementById("formTitle");
const cancelBtn = document.getElementById("cancelEdit");
const submitBtn = document.getElementById("submitBtn");

let editingId = null;

/* ==========================
   Helper: Parse JSON or line-separated text
========================== */
function parseArrayInput(input) {
  if (!input || input.trim() === "") return [];
  
  try {
    // Try parsing as JSON first
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // Not JSON, try line-separated
    return input
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
  
  return [];
}

/* ==========================
   Helper: Parse JSON objects
========================== */
function parseJsonObject(input) {
  if (!input || input.trim() === "") return {};
  
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch (e) {
    // Continue
  }
  
  return {};
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
   Add CSS animation
========================== */
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

/* ==========================
   Load and display candidates
========================== */
async function loadAndDisplayCandidates() {
  try {
    const candidates = await getAllCandidates();
    const container = document.getElementById("candidateList") || createCandidateList();
    
    container.innerHTML = "";
    
    if (candidates.length === 0) {
      container.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">No candidates found. Add one to get started.</p>';
      return;
    }

    candidates.forEach(candidate => {
      const fulfillment = calculateFulfillmentPercentage(candidate);
      const fundUtil = calculateFundUtilization(candidate);
      
      const row = document.createElement("div");
      row.style.cssText = `
        background: var(--bg-white);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        padding: 1.5rem;
        margin-bottom: 1rem;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 1.5rem;
        align-items: center;
      `;
      
      row.innerHTML = `
        <div>
          <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem;">${escapeHtml(candidate.name || "Unnamed")}</h3>
          <p style="margin: 0.25rem 0; color: var(--text-secondary); font-size: 0.95rem;">
            <strong>Party:</strong> ${escapeHtml(candidate.party || "Independent")} | 
            <strong>Constituency:</strong> ${escapeHtml(candidate.constituency || "Not set")}
          </p>
          <p style="margin: 0.25rem 0; color: var(--text-secondary); font-size: 0.95rem;">
            <strong>Promise Fulfillment:</strong> ${fulfillment}% | 
            <strong>Fund Utilization:</strong> ${fundUtil}%
          </p>
          <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.85rem;">
            ${candidate.education ? `Education: ${escapeHtml(candidate.education)}` : ""}
          </p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-primary edit-btn" data-id="${candidate.id}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Edit</button>
          <button class="btn btn-danger delete-btn" data-id="${candidate.id}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Delete</button>
        </div>
      `;
      
      container.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading candidates:", error);
    showNotification("Error loading candidates", "error");
  }
}

/* ==========================
   Create candidate list container if missing
========================== */
function createCandidateList() {
  const existingList = document.getElementById("candidateList");
  if (existingList) return existingList;
  
  const container = document.createElement("section");
  container.id = "candidateList";
  container.className = "admin-list";
  container.style.marginTop = "3rem";
  
  const heading = document.createElement("h2");
  heading.textContent = "All Candidates";
  container.appendChild(heading);
  
  const listDiv = document.createElement("div");
  listDiv.id = "candidateListContainer";
  listDiv.style.cssText = "margin-top: 1.5rem;";
  container.appendChild(listDiv);
  
  document.querySelector("main.admin-container").appendChild(container);
  return listDiv;
}

/* ==========================
   Helper: Escape HTML to prevent XSS
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
   Form Submit Handler
========================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  try {
    submitBtn.disabled = true;
    submitBtn.textContent = editingId ? "Updating..." : "Saving...";
    
    // Collect form data
    const data = {
      name: document.getElementById("name").value?.trim(),
      party: document.getElementById("party").value?.trim(),
      constituency: document.getElementById("constituency").value?.trim(),
      education: document.getElementById("education").value?.trim(),
      pastPerformance: document.getElementById("pastPerformance").value?.trim(),
      criminalCases: parseArrayInput(document.getElementById("criminalCases").value),
      politicalHistory: parseArrayInput(document.getElementById("politicalHistory").value),
      transparencyScore: parseInt(document.getElementById("transparencyScore").value) || 0,
      promisesTotal: parseInt(document.getElementById("promisesTotal").value) || 0,
      promisesCompleted: parseInt(document.getElementById("promisesCompleted").value) || 0,
      fundsAllocated: parseInt(document.getElementById("fundsAllocated").value) || 0,
      fundsUtilized: parseInt(document.getElementById("fundsUtilized").value) || 0,
      assets: parseJsonObject(document.getElementById("assetDetails").value),
      liabilities: parseJsonObject(document.getElementById("liabilityDetails").value)
    };

    // Validate required fields
    if (!data.name) {
      showNotification("Please enter candidate name", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = editingId ? "Update Candidate" : "Save Candidate";
      return;
    }

    // Validate promise counts
    if (data.promisesCompleted > data.promisesTotal && data.promisesTotal > 0) {
      showNotification("Promises completed cannot exceed total promises", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = editingId ? "Update Candidate" : "Save Candidate";
      return;
    }

    // Validate funds
    if (data.fundsUtilized > data.fundsAllocated && data.fundsAllocated > 0) {
      showNotification("Funds utilized cannot exceed funds allocated", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = editingId ? "Update Candidate" : "Save Candidate";
      return;
    }

    // Handle image upload
    const fileInput = document.getElementById("profileImage");
    if (fileInput.files.length > 0) {
      try {
        const imageUrl = await uploadImage(fileInput.files[0]);
        data.profileImage = imageUrl;
      } catch (error) {
        console.error("Image upload error:", error);
        showNotification("Image upload failed, continuing without image", "error");
      }
    }

    // Create or update
    if (editingId) {
      await updateCandidate(editingId, data);
      showNotification("Candidate updated successfully!");
    } else {
      await createCandidate(data);
      showNotification("Candidate created successfully!");
    }

    resetForm();
    await loadAndDisplayCandidates();
  } catch (error) {
    console.error("Form submission error:", error);
    showNotification("Error saving candidate: " + error.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editingId ? "Update Candidate" : "Save Candidate";
  }
});

/* ==========================
   Edit & Delete Actions
========================== */
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("edit-btn")) {
    const candidateId = e.target.dataset.id;
    const candidate = await getCandidateById(candidateId);
    
    if (!candidate) {
      showNotification("Candidate not found", "error");
      return;
    }

    editingId = candidateId;
    formTitle.textContent = "Edit Candidate";
    submitBtn.textContent = "Update Candidate";
    cancelBtn.classList.remove("hidden");

    // Populate form
    document.getElementById("name").value = candidate.name || "";
    document.getElementById("party").value = candidate.party || "";
    document.getElementById("constituency").value = candidate.constituency || "";
    document.getElementById("education").value = candidate.education || "";
    document.getElementById("pastPerformance").value = candidate.pastPerformance || "";
    document.getElementById("transparencyScore").value = candidate.transparencyScore || "";
    document.getElementById("promisesTotal").value = candidate.promisesTotal || "";
    document.getElementById("promisesCompleted").value = candidate.promisesCompleted || "";
    document.getElementById("fundsAllocated").value = candidate.fundsAllocated || "";
    document.getElementById("fundsUtilized").value = candidate.fundsUtilized || "";
    
    // Populate arrays
    document.getElementById("criminalCases").value = Array.isArray(candidate.criminalCases) 
      ? candidate.criminalCases.join("\n") 
      : "";
    document.getElementById("politicalHistory").value = Array.isArray(candidate.politicalHistory) 
      ? candidate.politicalHistory.join("\n") 
      : "";
    
    // Populate JSON objects
    document.getElementById("assetDetails").value = candidate.assets && Object.keys(candidate.assets).length > 0
      ? JSON.stringify(candidate.assets, null, 2)
      : "";
    document.getElementById("liabilityDetails").value = candidate.liabilities && Object.keys(candidate.liabilities).length > 0
      ? JSON.stringify(candidate.liabilities, null, 2)
      : "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (e.target.classList.contains("delete-btn")) {
    const candidateId = e.target.dataset.id;
    if (!confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteCandidate(candidateId);
      showNotification("Candidate deleted successfully");
      await loadAndDisplayCandidates();
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("Error deleting candidate", "error");
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
  formTitle.textContent = "Add New Candidate";
  submitBtn.textContent = "Save Candidate";
  cancelBtn.classList.add("hidden");
}

/* ==========================
   Initialize
========================== */

// Show demo data section in development (check if localhost)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  const demoSection = document.getElementById('demoDataSection');
  if (demoSection) demoSection.style.display = 'block';
  
  const loadDemoBtn = document.getElementById('loadDemoDataBtn');
  if (loadDemoBtn) {
    loadDemoBtn.addEventListener('click', async () => {
      if (confirm('⚠️ This will add 5 demo candidates with promises and feedback. Continue?')) {
        loadDemoBtn.disabled = true;
        loadDemoBtn.textContent = 'Loading...';
        
        try {
          const { loadDemoData } = await import('../demo-data-loader.js');
          await loadDemoData();
          
          // Reload after success
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error('Demo load error:', error);
          alert('Error loading demo data: ' + error.message);
          loadDemoBtn.disabled = false;
          loadDemoBtn.textContent = 'Load Demo Data';
        }
      }
    });
  }
}

loadAndDisplayCandidates();
