// /assets/js/pages/campare.js
// Candidate comparison page
// Side-by-side comparison of up to 2 candidates

import { getAllCandidates, getCandidateById } from "../firestore/candidates.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";

// State management
let allCandidates = [];
let selectedCandidates = [null, null];
let compareList = [];

// Get IDs from URL parameters
const idsParam = new URLSearchParams(window.location.search).get('ids');
const backBtn = document.getElementById("backBtn") || document.createElement("button");

/**
 * Show loading spinner
 */
function showLoading() {
  const container = document.getElementById("compareContainer");
  if (container) {
    container.innerHTML = '<div class="loading-spinner">Loading candidates...</div>';
  }
}

/**
 * Hide loading spinner
 */
function hideLoading() {
  const spinner = document.querySelector(".loading-spinner");
  if (spinner) {
    spinner.remove();
  }
}

/**
 * Render message in container
 */
function renderMessage(message) {
  const container = document.getElementById("compareContainer");
  if (container) {
    container.innerHTML = `<p class="message">${message}</p>`;
  }
}

/**
 * Populate dropdown selects with candidates
 */
function populateDropdowns() {
  const select1 = document.getElementById("candidateSelect1");
  const select2 = document.getElementById("candidateSelect2");

  const options = allCandidates.map(c => `
    <option value="${c.id}">${c.name || "Unknown"} (${c.party || "Independent"})</option>
  `).join("");

  if (select1) {
    select1.innerHTML = '<option value="">-- Select Candidate 1 --</option>' + options;
  }

  if (select2) {
    select2.innerHTML = '<option value="">-- Select Candidate 2 --</option>' + options;
  }

  // Restore from localStorage if available
  if (compareList.length >= 2) {
    if (select1) select1.value = compareList[0].id;
    if (select2) select2.value = compareList[1].id;
    loadComparison();
  }
}

/**
 * Setup dropdown change event listeners
 */
function setupDropdownListeners() {
  const select1 = document.getElementById("candidateSelect1");
  const select2 = document.getElementById("candidateSelect2");

  if (select1) {
    select1.addEventListener("change", async (e) => {
      selectedCandidates[0] = e.target.value ? await getCandidateById(e.target.value) : null;
      loadComparison();
    });
  }

  if (select2) {
    select2.addEventListener("change", async (e) => {
      selectedCandidates[1] = e.target.value ? await getCandidateById(e.target.value) : null;
      loadComparison();
    });
  }
}

/**
 * Load and display comparison table
 */
async function loadComparison() {
  const tableContainer = document.getElementById("comparisonTable");
  if (!tableContainer) return;

  // Hide if not both candidates selected
  if (!selectedCandidates[0] || !selectedCandidates[1]) {
    tableContainer.innerHTML = '<p class="empty-state">Select two candidates to compare.</p>';
    return;
  }

  const c1 = selectedCandidates[0];
  const c2 = selectedCandidates[1];

  const html = `
    <div class="comparison-wrapper">
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Attribute</th>
            <th class="candidate-col">
              <div class="candidate-header">
                <img src="${c1.profileImage || '/assets/images/default-avatar.png'}" alt="${c1.name}" />
                <div>
                  <h3>${c1.name || "Unknown"}</h3>
                  <p>${c1.party || "Independent"}</p>
                </div>
              </div>
            </th>
            <th class="candidate-col">
              <div class="candidate-header">
                <img src="${c2.profileImage || '/assets/images/default-avatar.png'}" alt="${c2.name}" />
                <div>
                  <h3>${c2.name || "Unknown"}</h3>
                  <p>${c2.party || "Independent"}</p>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Party</strong></td>
            <td class="candidate-col">${c1.party || "Independent"}</td>
            <td class="candidate-col">${c2.party || "Independent"}</td>
          </tr>
          <tr>
            <td><strong>Constituency</strong></td>
            <td class="candidate-col">${c1.constituency || "N/A"}</td>
            <td class="candidate-col">${c2.constituency || "N/A"}</td>
          </tr>
          <tr>
            <td><strong>Education</strong></td>
            <td class="candidate-col">${c1.education || "Not disclosed"}</td>
            <td class="candidate-col">${c2.education || "Not disclosed"}</td>
          </tr>
          <tr>
            <td><strong>Assets</strong></td>
            <td class="candidate-col">${formatCurrency(c1.assets)}</td>
            <td class="candidate-col">${formatCurrency(c2.assets)}</td>
          </tr>
          <tr>
            <td><strong>Liabilities</strong></td>
            <td class="candidate-col">${formatCurrency(c1.liabilities)}</td>
            <td class="candidate-col">${formatCurrency(c2.liabilities)}</td>
          </tr>
          <tr>
            <td><strong>Net Worth</strong></td>
            <td class="candidate-col">${formatCurrency((c1.assets || 0) - (c1.liabilities || 0))}</td>
            <td class="candidate-col">${formatCurrency((c2.assets || 0) - (c2.liabilities || 0))}</td>
          </tr>
          <tr>
            <td><strong>Criminal Cases</strong></td>
            <td class="candidate-col">${c1.criminalCases || 0}</td>
            <td class="candidate-col">${c2.criminalCases || 0}</td>
          </tr>
          <tr>
            <td><strong>Transparency Score</strong></td>
            <td class="candidate-col">${c1.transparencyScore ? c1.transparencyScore + "%" : "N/A"}</td>
            <td class="candidate-col">${c2.transparencyScore ? c2.transparencyScore + "%" : "N/A"}</td>
          </tr>
          <tr>
            <td><strong>Promises Made</strong></td>
            <td class="candidate-col">${c1.promisesTotal || 0}</td>
            <td class="candidate-col">${c2.promisesTotal || 0}</td>
          </tr>
          <tr>
            <td><strong>Promises Fulfilled</strong></td>
            <td class="candidate-col">${c1.promisesCompleted || 0}</td>
            <td class="candidate-col">${c2.promisesCompleted || 0}</td>
          </tr>
          <tr>
            <td><strong>Verification Status</strong></td>
            <td class="candidate-col">
              <span class="status-badge ${c1.verified ? "verified" : "unverified"}">
                ${c1.verified ? "✓ Verified" : "○ Unverified"}
              </span>
            </td>
            <td class="candidate-col">
              <span class="status-badge ${c2.verified ? "verified" : "unverified"}">
                ${c2.verified ? "✓ Verified" : "○ Unverified"}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="comparison-actions">
        <button class="btn-export" id="exportBtn">📥 Export Comparison</button>
        <button class="btn-reset" id="resetBtn">🔄 Reset Comparison</button>
      </div>
    </div>
  `;

  tableContainer.innerHTML = html;

  // Setup export button
  document.getElementById("exportBtn").addEventListener("click", exportComparison);
  
  // Setup reset button
  document.getElementById("resetBtn").addEventListener("click", resetComparison);

  // Save to localStorage
  compareList = [
    { id: c1.id, name: c1.name },
    { id: c2.id, name: c2.name }
  ];
  localStorage.setItem("compareList", JSON.stringify(compareList));
}

/**
 * Export comparison as CSV
 */
function exportComparison() {
  if (!selectedCandidates[0] || !selectedCandidates[1]) {
    alert("Please select two candidates first.");
    return;
  }

  const c1 = selectedCandidates[0];
  const c2 = selectedCandidates[1];

  const data = [
    ["Attribute", c1.name, c2.name],
    ["Party", c1.party || "Independent", c2.party || "Independent"],
    ["Constituency", c1.constituency || "N/A", c2.constituency || "N/A"],
    ["Education", c1.education || "Not disclosed", c2.education || "Not disclosed"],
    ["Assets", c1.assets || 0, c2.assets || 0],
    ["Liabilities", c1.liabilities || 0, c2.liabilities || 0],
    ["Criminal Cases", c1.criminalCases || 0, c2.criminalCases || 0],
    ["Transparency Score", c1.transparencyScore || "N/A", c2.transparencyScore || "N/A"],
    ["Promises Made", c1.promisesTotal || 0, c2.promisesTotal || 0],
    ["Promises Fulfilled", c1.promisesCompleted || 0, c2.promisesCompleted || 0]
  ];

  const csv = data.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
  
  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `comparison_${c1.name}_vs_${c2.name}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Reset comparison
 */
function resetComparison() {
  selectedCandidates = [null, null];
  compareList = [];

  const select1 = document.getElementById("candidateSelect1");
  const select2 = document.getElementById("candidateSelect2");
  const tableContainer = document.getElementById("comparisonTable");

  if (select1) select1.value = "";
  if (select2) select2.value = "";
  if (tableContainer) tableContainer.innerHTML = '<p class="empty-state">Select two candidates to compare.</p>';

  localStorage.removeItem("compareList");
}

/**
 * Initialize compare page
 */
async function initializePage() {
  showLoading();

  try {
    allCandidates = await getAllCandidates();

    hideLoading();
    populateDropdowns();
    setupDropdownListeners();
  } catch (error) {
    console.error("Error initializing compare page:", error);
    const container = document.getElementById("compareContainer");
    if (container) {
      container.innerHTML = '<p class="error-message">Error loading candidates. Please refresh the page.</p>';
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}

/**
 * Render comparison view
 */
async function renderComparison(ids) {
  try {
    showLoading();

    const candidates = await Promise.all(ids.map(id => getCandidateById(id)));
    const filteredCandidates = candidates.filter(c => c !== null);

    if (filteredCandidates.length === 0) {
      renderMessage("No candidates found for comparison.");
      return;
    }

    const container = document.getElementById("compareContainer");
    if (!container) return;

    const fields = [
      { key: "party", label: "Party" },
      { key: "constituency", label: "Constituency" },
      { key: "education", label: "Education" },
      { key: "assets", label: "Assets", format: "currency" },
      { key: "liabilities", label: "Liabilities", format: "currency" },
      { key: "criminalCases", label: "Criminal Cases" },
      { key: "transparencyScore", label: "Transparency Score", format: "percentage" }
    ];

    let html = `<section class="compare-grid">`;

    // Header row
    html += `<div class="compare-row header">
      <div class="cell"></div>
      ${candidates.map(c => `<div class="cell"><strong>${c.name || "Unnamed"}</strong></div>`).join("")}
    </div>`;

    // Data rows
    fields.forEach(field => {
      html += `<div class="compare-row">
        <div class="cell label">${field.label}</div>
        ${candidates.map(c => `<div class="cell">${c[field.key] || "N/A"}</div>`).join("")}
      </div>`;
    });

    html += `</section>`;

    container.innerHTML = html;

  } catch (error) {
    console.error("Comparison error:", error);
    renderMessage("Failed to load candidate comparison.");
  }
}

/* ===========================
   Init
   =========================== */
if (!idsParam) {
  renderMessage("No candidates selected for comparison.");
} else {
  const ids = idsParam.split(",").map(id => id.trim()).filter(Boolean);
  renderComparison(ids);
}

backBtn.addEventListener("click", () => {
  window.location.href = "/public/candidate.html";
});
