/**
 * Election Promises Page
 * Displays all promises grouped by candidate with filtering by status and category
 */

import { getAllCandidates, getCandidateById, calculateFulfillmentPercentage } from "../firestore/candidates.js";
import { getAllPromises } from "../firestore/promises.js";

const promisesContainer = document.getElementById("promisesContainer");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");

let allPromises = [];
let allCandidates = [];

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
   Load and Render Promises
========================== */
async function loadAndRender() {
  try {
    allPromises = await getAllPromises();
    allCandidates = await getAllCandidates();

    applyFilters();
  } catch (error) {
    console.error("Error loading promises:", error);
    promisesContainer.innerHTML = `
      <div class="empty-state">
        <p style="color: var(--danger-color);">Error loading promises. Please try again.</p>
      </div>
    `;
  }
}

/* ==========================
   Apply Filters and Render
========================== */
function applyFilters() {
  const selectedStatus = statusFilter.value;
  const selectedCategory = categoryFilter.value;

  // Filter promises
  let filtered = allPromises.filter(promise => {
    const statusMatch = !selectedStatus || promise.status === selectedStatus;
    const categoryMatch = !selectedCategory || promise.category === selectedCategory;
    return statusMatch && categoryMatch;
  });

  // Group by candidate
  renderGroupedPromises(filtered);
}

/* ==========================
   Render Promises Grouped by Candidate
========================== */
function renderGroupedPromises(promises) {
  if (promises.length === 0) {
    promisesContainer.innerHTML = `
      <div class="empty-state">
        <p>No promises found matching your filters.</p>
      </div>
    `;
    return;
  }

  // Group promises by candidateId
  const grouped = {};
  promises.forEach(promise => {
    const candidateId = promise.candidateId || "unknown";
    if (!grouped[candidateId]) {
      grouped[candidateId] = [];
    }
    grouped[candidateId].push(promise);
  });

  promisesContainer.innerHTML = "";

  // Render each candidate's promises
  Object.entries(grouped).forEach(([candidateId, candidatePromises]) => {
    const candidate = allCandidates.find(c => c.id === candidateId);
    const candidateName = candidate ? candidate.name : "Unknown Candidate";
    const party = candidate ? candidate.party : "Independent";
    const fulfillment = candidate ? calculateFulfillmentPercentage(candidate) : 0;

    const group = document.createElement("div");
    group.className = "candidate-promises-group";

    const header = document.createElement("div");
    header.className = "group-header";
    header.style.cursor = "pointer";
    header.innerHTML = `
      <div>
        <h3>${escapeHtml(candidateName)}</h3>
        <p class="group-meta">
          <strong>Party:</strong> ${escapeHtml(party)} | 
          <strong>Promise Fulfillment:</strong> ${fulfillment}%
        </p>
      </div>
      <div class="group-collapse-icon">▶</div>
    `;

    const promisesList = document.createElement("div");
    promisesList.className = "promises-list";
    promisesList.style.display = "block";

    // Create promise cards
    candidatePromises.forEach(promise => {
      const statusClass = `badge-${promise.status || "planned"}`;
      const percentage = promise.completionPercentage || 0;

      const card = document.createElement("div");
      card.className = "promise-card";
      card.innerHTML = `
        <h4>${escapeHtml(promise.title || "Untitled Promise")}</h4>
        <div class="promise-meta">
          <span class="promise-badge ${statusClass}">${promise.status || "planned"}</span>
          ${promise.category ? `<span style="color: var(--text-secondary); font-size: 0.9rem;">📁 ${escapeHtml(promise.category)}</span>` : ""}
        </div>
        ${promise.description ? `<p class="promise-description">${escapeHtml(promise.description)}</p>` : ""}
        <div class="promise-progress-section">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%;"></div>
          </div>
          <div class="progress-text">
            <strong>Progress:</strong> ${percentage}% Complete
          </div>
        </div>
        ${promise.proofLinks && promise.proofLinks.length > 0 ? `
          <div class="promise-links">
            <strong>📎 Proof & Documentation:</strong><br>
            ${promise.proofLinks.map((link, idx) => `
              <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">
                Proof Link ${idx + 1}
              </a>
            `).join("")}
          </div>
        ` : ""}
        ${promise.completionDate ? `<p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">✓ Completed on: ${escapeHtml(promise.completionDate)}</p>` : ""}
      `;

      promisesList.appendChild(card);
    });

    group.appendChild(header);
    group.appendChild(promisesList);
    promisesContainer.appendChild(group);

    // Toggle collapse/expand on click
    header.addEventListener("click", () => {
      const isVisible = promisesList.style.display !== "none";
      promisesList.style.display = isVisible ? "none" : "block";
      const icon = header.querySelector(".group-collapse-icon");
      if (icon) {
        icon.classList.toggle("collapsed", isVisible);
      }
    });
  });
}

/* ==========================
   Filter Event Listeners
========================== */
statusFilter.addEventListener("change", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

/* ==========================
   Initialize
========================== */
loadAndRender();
