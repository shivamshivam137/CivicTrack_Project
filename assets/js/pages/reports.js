// /assets/js/pages/reports.js
// Reports page - displays reports organized by type
// Shows candidate information, verification status, statistics
// Filter by report type

import { getAllCandidates } from "../firestore/candidates.js";
import { getAllReports } from "../firestore/reports.js";
import { formatDate } from "../utils/formatters.js";

// State management
let allReports = [];
let allCandidates = [];
let filteredReports = [];

/**
 * Show loading spinner
 */
function showLoading() {
  const container = document.getElementById("reportsContainer");
  if (container) {
    container.innerHTML = '<div class="loading-spinner">Loading reports...</div>';
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
 * Get candidate name by ID
 */
function getCandidateName(candidateId) {
  const candidate = allCandidates.find(c => c.id === candidateId);
  return candidate ? candidate.name : "Unknown Candidate";
}

/**
 * Render reports organized by type
 */
function renderReportsByType(reports) {
  const container = document.getElementById("reportsContainer");
  if (!container) return;

  if (reports.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No reports found matching your criteria.</p></div>';
    return;
  }

  // Group reports by type
  const groupedByType = {};
  reports.forEach(report => {
    const reportType = report.type || "other";
    if (!groupedByType[reportType]) {
      groupedByType[reportType] = [];
    }
    groupedByType[reportType].push(report);
  });

  let html = '<div class="reports-grouped">';

  Object.entries(groupedByType).forEach(([reportType, typeReports]) => {
    const displayType = reportType.charAt(0).toUpperCase() + reportType.slice(1);
    
    html += `
      <section class="report-type-section">
        <h2>${displayType} Reports (${typeReports.length})</h2>
        <div class="reports-list">
    `;

    typeReports.forEach(report => {
      const candidateName = getCandidateName(report.candidateId);
      const statusClass = report.verified ? "verified" : "unverified";
      const statusText = report.verified ? "✓ Verified" : "○ Unverified";
      
      html += `
        <div class="report-card">
          <div class="report-header">
            <div class="report-info">
              <h3>${candidateName}</h3>
              <p class="report-type-label">${displayType} Report</p>
            </div>
            <span class="report-status ${statusClass}">${statusText}</span>
          </div>
          
          <div class="report-body">
            ${report.description ? `<p class="report-description">${report.description}</p>` : ""}
            
            <div class="report-details">
      `;

      if (report.source) {
        html += `<p><strong>Source:</strong> ${report.source}</p>`;
      }

      if (report.createdAt) {
        html += `<p><strong>Reported:</strong> ${formatDate(report.createdAt)}</p>`;
      }

      if (report.severity) {
        html += `<p><strong>Severity:</strong> <span class="severity-${report.severity}">${report.severity}</span></p>`;
      }

      html += `</div>`;

      if (report.documentLinks && report.documentLinks.length > 0) {
        html += `
          <div class="document-links">
            <strong>Supporting Documents:</strong>
            <ul>
        `;
        report.documentLinks.forEach((link, index) => {
          html += `<li><a href="${link}" target="_blank" rel="noopener">Document ${index + 1}</a></li>`;
        });
        html += `</ul></div>`;
      }

      html += `
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </section>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

/**
 * Setup type filter
 */
function setupTypeFilter() {
  const typeFilter = document.getElementById("reportTypeFilter");
  if (typeFilter) {
    typeFilter.addEventListener("change", filterReports);
  }
}

/**
 * Filter reports by type
 */
function filterReports() {
  const selectedType = document.getElementById("reportTypeFilter")?.value || "";

  if (selectedType) {
    filteredReports = allReports.filter(report => report.type === selectedType);
  } else {
    filteredReports = allReports;
  }

  renderReportsByType(filteredReports);
}

/**
 * Setup verification filter
 */
function setupVerificationFilter() {
  const verificationFilter = document.getElementById("verificationFilter");
  if (verificationFilter) {
    verificationFilter.addEventListener("change", filterByVerification);
  }
}

/**
 * Filter reports by verification status
 */
function filterByVerification() {
  const selectedFilter = document.getElementById("verificationFilter")?.value || "";
  let statusFilter = document.getElementById("reportTypeFilter")?.value || "";

  if (selectedFilter === "verified") {
    filteredReports = allReports.filter(report => report.verified === true);
  } else if (selectedFilter === "unverified") {
    filteredReports = allReports.filter(report => report.verified !== true);
  } else {
    filteredReports = allReports;
  }

  if (statusFilter) {
    filteredReports = filteredReports.filter(report => report.type === statusFilter);
  }

  renderReportsByType(filteredReports);
}

/**
 * Setup search functionality
 */
function setupSearch() {
  const searchInput = document.getElementById("reportSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      
      if (searchTerm.trim() === "") {
        filteredReports = allReports;
      } else {
        filteredReports = allReports.filter(report => {
          const candidateName = getCandidateName(report.candidateId).toLowerCase();
          const description = (report.description || "").toLowerCase();
          const source = (report.source || "").toLowerCase();
          
          return candidateName.includes(searchTerm) || 
                 description.includes(searchTerm) || 
                 source.includes(searchTerm);
        });
      }

      renderReportsByType(filteredReports);
    });
  }
}

/**
 * Populate type filter options
 */
function populateTypeFilter() {
  const typeFilter = document.getElementById("reportTypeFilter");
  if (typeFilter) {
    const types = [...new Set(allReports.map(r => r.type).filter(Boolean))];
    typeFilter.innerHTML = '<option value="">All Types</option>' + 
      types.map(type => `
        <option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>
      `).join("");
  }
}

/**
 * Display report statistics
 */
function displayStatistics() {
  const statsContainer = document.getElementById("reportStats");
  if (!statsContainer) return;

  const totalCandidates = allCandidates.length;
  const verifiedCandidates = allCandidates.filter(c => c.verified).length;
  const totalReports = allReports.length;
  const verifiedReports = allReports.filter(r => r.verified).length;

  const criminalReports = allReports.filter(r => r.type === "criminal").length;
  const assetReports = allReports.filter(r => r.type === "asset").length;
  const performanceReports = allReports.filter(r => r.type === "performance").length;

  const html = `
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">${totalCandidates}</span>
        <span class="stat-label">Total Candidates</span>
      </div>
      <div class="stat-card verified">
        <span class="stat-value">${verifiedCandidates}</span>
        <span class="stat-label">Verified Candidates</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${totalReports}</span>
        <span class="stat-label">Total Reports</span>
      </div>
      <div class="stat-card verified">
        <span class="stat-value">${verifiedReports}</span>
        <span class="stat-label">Verified Reports</span>
      </div>
      <div class="stat-card criminal">
        <span class="stat-value">${criminalReports}</span>
        <span class="stat-label">Criminal Reports</span>
      </div>
      <div class="stat-card asset">
        <span class="stat-value">${assetReports}</span>
        <span class="stat-label">Asset Reports</span>
      </div>
      <div class="stat-card performance">
        <span class="stat-value">${performanceReports}</span>
        <span class="stat-label">Performance Reports</span>
      </div>
    </div>
  `;

  statsContainer.innerHTML = html;
}

/**
 * Initialize reports page
 */
async function initializePage() {
  showLoading();

  try {
    // Load all data
    const [reports, candidates] = await Promise.all([
      getAllReports(),
      getAllCandidates()
    ]);

    allReports = reports;
    allCandidates = candidates;
    filteredReports = allReports;

    hideLoading();

    // Render content
    if (allReports.length === 0) {
      const container = document.getElementById("reportsContainer");
      if (container) {
        container.innerHTML = '<div class="empty-state"><p>No reports found in the database.</p></div>';
      }
    } else {
      displayStatistics();
      populateTypeFilter();
      renderReportsByType(filteredReports);
      setupTypeFilter();
      setupVerificationFilter();
      setupSearch();
    }
  } catch (error) {
    console.error("Error initializing reports page:", error);
    const container = document.getElementById("reportsContainer");
    if (container) {
      container.innerHTML = '<p class="error-message">Error loading reports. Please refresh the page.</p>';
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}
