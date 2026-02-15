// /assets/js/pages/verify-data.js
// Admin verification page - protected by role-guard.js
// Verify and approve candidates and reports
// Update verification status in Firestore

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { auth } from "../../../firebase/firebase-config.js";
import { getAllCandidates, getCandidateById, updateCandidate } from "../firestore/candidates.js";
import { getAllReports, getReportById, updateReport } from "../firestore/reports.js";
import { formatDate } from "../utils/formatters.js";

// State management
let allCandidates = [];
let allReports = [];
let unverifiedCandidates = [];
let unverifiedReports = [];
let currentUser = null;

/**
 * Show loading spinner
 */
function showLoading(elementId) {
  const container = document.getElementById(elementId);
  if (container) {
    container.innerHTML = '<div class="loading-spinner">Loading...</div>';
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
 * Display admin verification panel header
 */
function displayAdminHeader() {
  const headerContainer = document.getElementById("adminHeader");
  if (!headerContainer) return;

  const html = `
    <div class="admin-panel-header">
      <h1>🛡️ Data Verification Admin Panel</h1>
      <p class="admin-info">Logged in as: <strong>${currentUser?.email || "Admin"}</strong></p>
      <p class="panel-description">Review and verify unverified candidates and reports. Update their verification status in the database.</p>
    </div>
  `;

  headerContainer.innerHTML = html;
}

/**
 * Render unverified candidates section
 */
function renderUnverifiedCandidates() {
  const container = document.getElementById("unverifiedCandidatesContainer");
  if (!container) return;

  if (unverifiedCandidates.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>✓ All candidates are verified!</p></div>';
    return;
  }

  let html = `
    <div class="verification-list">
      <h2>Unverified Candidates (${unverifiedCandidates.length})</h2>
  `;

  unverifiedCandidates.forEach(candidate => {
    html += `
      <div class="verification-card" data-type="candidate" data-id="${candidate.id}">
        <div class="card-header">
          <div class="card-info">
            <h3>${candidate.name || "Unknown"}</h3>
            <p class="card-party">${candidate.party || "Independent"}</p>
            <p class="card-constituency">${candidate.constituency || "N/A"}</p>
          </div>
          <span class="status-badge unverified">○ Unverified</span>
        </div>

        <div class="card-details">
          <p><strong>Education:</strong> ${candidate.education || "Not disclosed"}</p>
          <p><strong>Assets:</strong> ₹${candidate.assets ? candidate.assets.toLocaleString() : "0"}</p>
          <p><strong>Liabilities:</strong> ₹${candidate.liabilities ? candidate.liabilities.toLocaleString() : "0"}</p>
          <p><strong>Criminal Cases:</strong> ${candidate.criminalCases || 0}</p>
          <p><strong>Transparency Score:</strong> ${candidate.transparencyScore ? candidate.transparencyScore + "%" : "N/A"}</p>
          ${candidate.createdAt ? `<p><strong>Created:</strong> ${formatDate(candidate.createdAt)}</p>` : ""}
        </div>

        <div class="card-actions">
          <textarea class="verification-notes" placeholder="Add verification notes..." rows="3"></textarea>
          <div class="button-group">
            <button class="btn-verify" data-id="${candidate.id}" data-type="candidate">✓ Verify Candidate</button>
            <button class="btn-reject" data-id="${candidate.id}" data-type="candidate">✗ Reject</button>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;

  setupVerificationListeners();
}

/**
 * Render unverified reports section
 */
function renderUnverifiedReports() {
  const container = document.getElementById("unverifiedReportsContainer");
  if (!container) return;

  if (unverifiedReports.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>✓ All reports are verified!</p></div>';
    return;
  }

  let html = `
    <div class="verification-list">
      <h2>Unverified Reports (${unverifiedReports.length})</h2>
  `;

  unverifiedReports.forEach(report => {
    const candidate = allCandidates.find(c => c.id === report.candidateId);
    const candidateName = candidate ? candidate.name : "Unknown";
    const reportType = report.type ? report.type.charAt(0).toUpperCase() + report.type.slice(1) : "Report";

    html += `
      <div class="verification-card" data-type="report" data-id="${report.id}">
        <div class="card-header">
          <div class="card-info">
            <h3>${reportType} - ${candidateName}</h3>
            <p class="card-description">${report.description || "No description"}</p>
          </div>
          <span class="status-badge unverified">○ Unverified</span>
        </div>

        <div class="card-details">
          <p><strong>Report Type:</strong> ${reportType}</p>
          <p><strong>Source:</strong> ${report.source || "Not specified"}</p>
          ${report.severity ? `<p><strong>Severity:</strong> <span class="severity-${report.severity}">${report.severity}</span></p>` : ""}
          ${report.createdAt ? `<p><strong>Submitted:</strong> ${formatDate(report.createdAt)}</p>` : ""}
        </div>

        ${report.documentLinks && report.documentLinks.length > 0 ? `
          <div class="document-section">
            <strong>Supporting Documents:</strong>
            <ul>
              ${report.documentLinks.map((link, idx) => `<li><a href="${link}" target="_blank" rel="noopener">Document ${idx + 1}</a></li>`).join("")}
            </ul>
          </div>
        ` : ""}

        <div class="card-actions">
          <textarea class="verification-notes" placeholder="Add verification notes..." rows="3"></textarea>
          <div class="button-group">
            <button class="btn-verify" data-id="${report.id}" data-type="report">✓ Verify Report</button>
            <button class="btn-reject" data-id="${report.id}" data-type="report">✗ Reject</button>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;

  setupVerificationListeners();
}

/**
 * Setup verification button event listeners
 */
function setupVerificationListeners() {
  // Verify buttons
  document.querySelectorAll(".btn-verify").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = btn.getAttribute("data-id");
      const type = btn.getAttribute("data-type");
      const notes = btn.closest(".verification-card").querySelector(".verification-notes").value;

      await verifyItem(id, type, notes, btn);
    });
  });

  // Reject buttons
  document.querySelectorAll(".btn-reject").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = btn.getAttribute("data-id");
      const type = btn.getAttribute("data-type");
      const notes = btn.closest(".verification-card").querySelector(".verification-notes").value;

      await rejectItem(id, type, notes, btn);
    });
  });
}

/**
 * Verify an item (candidate or report)
 */
async function verifyItem(id, type, notes, btn) {
  try {
    btn.disabled = true;
    btn.textContent = "Processing...";

    if (type === "candidate") {
      await updateCandidate(id, {
        verified: true,
        verificationNotes: notes || null,
        verifiedBy: currentUser.uid,
        verifiedAt: new Date().toISOString()
      });

      // Remove from unverified list
      unverifiedCandidates = unverifiedCandidates.filter(c => c.id !== id);
      renderUnverifiedCandidates();
      alert("Candidate verified successfully!");
    } else if (type === "report") {
      await updateReport(id, {
        verified: true,
        verificationNotes: notes || null,
        verifiedBy: currentUser.uid,
        verifiedAt: new Date().toISOString()
      });

      // Remove from unverified list
      unverifiedReports = unverifiedReports.filter(r => r.id !== id);
      renderUnverifiedReports();
      alert("Report verified successfully!");
    }
  } catch (error) {
    console.error("Error verifying item:", error);
    alert("Error verifying item. Please try again.");
    btn.disabled = false;
    btn.textContent = type === "candidate" ? "✓ Verify Candidate" : "✓ Verify Report";
  }
}

/**
 * Reject an item (candidate or report)
 */
async function rejectItem(id, type, notes, btn) {
  const confirmReject = confirm(`Are you sure you want to reject this ${type}?`);
  if (!confirmReject) return;

  try {
    btn.disabled = true;
    btn.textContent = "Processing...";

    if (type === "candidate") {
      await updateCandidate(id, {
        rejectionReason: notes || "Rejected by admin",
        rejectedBy: currentUser.uid,
        rejectedAt: new Date().toISOString()
      });

      // Remove from unverified list
      unverifiedCandidates = unverifiedCandidates.filter(c => c.id !== id);
      renderUnverifiedCandidates();
      alert("Candidate rejected and removed from pending list.");
    } else if (type === "report") {
      await updateReport(id, {
        rejectionReason: notes || "Rejected by admin",
        rejectedBy: currentUser.uid,
        rejectedAt: new Date().toISOString()
      });

      // Remove from unverified list
      unverifiedReports = unverifiedReports.filter(r => r.id !== id);
      renderUnverifiedReports();
      alert("Report rejected and removed from pending list.");
    }
  } catch (error) {
    console.error("Error rejecting item:", error);
    alert("Error rejecting item. Please try again.");
    btn.disabled = false;
    btn.textContent = type === "candidate" ? "✗ Reject" : "✗ Reject";
  }
}

/**
 * Display verification statistics
 */
function displayVerificationStats() {
  const statsContainer = document.getElementById("verificationStats");
  if (!statsContainer) return;

  const totalCandidates = allCandidates.length;
  const verifiedCandidates = allCandidates.filter(c => c.verified).length;
  const totalReports = allReports.length;
  const verifiedReports = allReports.filter(r => r.verified).length;

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
        <span class="stat-value">${unverifiedCandidates.length}</span>
        <span class="stat-label">Pending Candidates</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${totalReports}</span>
        <span class="stat-label">Total Reports</span>
      </div>
      <div class="stat-card verified">
        <span class="stat-value">${verifiedReports}</span>
        <span class="stat-label">Verified Reports</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${unverifiedReports.length}</span>
        <span class="stat-label">Pending Reports</span>
      </div>
    </div>
  `;

  statsContainer.innerHTML = html;
}

/**
 * Initialize verification page
 */
async function initializePage() {
  // Check authentication
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "/public/login.html";
      return;
    }

    currentUser = user;
    displayAdminHeader();

    showLoading("unverifiedCandidatesContainer");
    showLoading("unverifiedReportsContainer");

    try {
      // Load all data
      const [candidates, reports] = await Promise.all([
        getAllCandidates(),
        getAllReports()
      ]);

      allCandidates = candidates;
      allReports = reports;

      // Filter unverified items
      unverifiedCandidates = candidates.filter(c => !c.verified);
      unverifiedReports = reports.filter(r => !r.verified);

      hideLoading();

      // Render content
      displayVerificationStats();
      renderUnverifiedCandidates();
      renderUnverifiedReports();
    } catch (error) {
      console.error("Error initializing verification page:", error);
      alert("Error loading verification data. Please refresh the page.");
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}
      <td>${p.candidateId}</td>
      <td>${p.title}</td>
      <td>${p.status}</td>
      <td>
        <button data-edit="${docSnap.id}">Edit</button>
        <button data-delete="${docSnap.id}">Delete</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

/* ===============================
   FORM SUBMIT (ADD / UPDATE)
================================ */

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    candidateId: fields.candidateId.value.trim(),
    title: fields.title.value.trim(),
    description: fields.description.value.trim(),
    status: fields.status.value,
    sourceUrl: fields.sourceUrl.value.trim() || null,
    updatedAt: serverTimestamp()
  };

  if (!data.candidateId || !data.title) return;

  try {
    if (fields.promiseId.value) {
      // UPDATE
      const ref = doc(db, "promises", fields.promiseId.value);
      await updateDoc(ref, data);
    } else {
      // CREATE
      await addDoc(promisesRef, {
        ...data,
        createdAt: serverTimestamp()
      });
    }

    resetForm();
    loadPromises();

  } catch (err) {
    console.error("Promise save failed:", err);
  }
});

/* ===============================
   TABLE ACTIONS
================================ */

tableBody.addEventListener("click", async (e) => {
  const editId = e.target.dataset.edit;
  const deleteId = e.target.dataset.delete;

  if (editId) {
    const snapshot = await getDocs(promisesRef);
    snapshot.forEach(d => {
      if (d.id === editId) {
        const p = d.data();
        populateForm(editId, p);
      }
    });
  }

  if (deleteId) {
    if (!confirm("Delete this promise?")) return;
    await deleteDoc(doc(db, "promises", deleteId));
    loadPromises();
  }
});

/* ===============================
   HELPERS
================================ */

function populateForm(id, data) {
  fields.promiseId.value = id;
  fields.candidateId.value = data.candidateId;
  fields.title.value = data.title;
  fields.description.value = data.description || "";
  fields.status.value = data.status;
  fields.sourceUrl.value = data.sourceUrl || "";

  formTitle.textContent = "Edit Promise";
  cancelEditBtn.hidden = false;
}

function resetForm() {
  form.reset();
  fields.promiseId.value = "";
  formTitle.textContent = "Add New Promise";
  cancelEditBtn.hidden = true;
}

cancelEditBtn.addEventListener("click", resetForm);

/* ===============================
   INIT
================================ */

loadPromises();



// ======================================================================================

// Collection Structure
// 🔹 Top-level collection (recommended)
// promises (collection)
//   └── promiseId (document)
// ✅ Why top-level and not subcollection?
// Allows cross-candidate analytics
// Enables global transparency reports
// Supports future features (search, filters, trends)
// Avoids Firestore subcollection aggregation pain
// 2️⃣ Document Schema (Field Definitions)
// Each document in promises represents one election promise.
// promises {
//   promiseId: string (auto-id)
//   candidateId: string        // REQUIRED
//   title: string              // REQUIRED (short summary)
//   description: string        // OPTIONAL (details)
//   status: "planned" | "in-progress" | "completed"   // REQUIRED

//   plannedDate: timestamp | null      // OPTIONAL
//   startDate: timestamp | null        // OPTIONAL
//   completedDate: timestamp | null    // OPTIONAL

//   sourceUrl: string | null   // OPTIONAL (manifesto / affidavit / speech link)

//   createdAt: timestamp       // REQUIRED (serverTimestamp)
//   updatedAt: timestamp       // REQUIRED (serverTimestamp)
// }

// 3️⃣ Field Rationale (Why Each Exists)
// 🔑 candidateId

// Foreign key to candidates/{candidateId}

// Enables:

// Candidate profile aggregation

// Promise completion stats

// Trend analysis

// ⚠️ Do NOT embed candidate data here
// → avoids duplication & sync bugs

// 🔄 status

// Strict enum:

// "planned" → announced, not started

// "in-progress" → work started

// "completed" → verifiably finished

// ✅ Enables:

// Completion percentage

// Time-based analytics

// Public trust scoring

// 📅 Date Fields (Optional by Design)
// Field	Meaning
// plannedDate	When promise was announced
// startDate	When execution began
// completedDate	When promise was fulfilled

// ✔ Optional to support:

// Partial data

// Older elections

// Incomplete records without breaking UI

// 🔗 sourceUrl

// Evidence link (government site, affidavit, manifesto)

// Improves credibility & transparency

// Can be displayed publicly without risk

// 4️⃣ Indexing Strategy (IMPORTANT)

// Create these composite indexes early:

// Collection: promises
// Fields:
// - candidateId ASC
// - status ASC


// Optional analytics index:

// - status ASC
// - completedDate DESC

// {
//   "candidateId": "cand_01",
//   "title": "Construction of Primary Health Center",
//   "description": "Build and staff a new PHC in Ward 12",
//   "status": "completed",
//   "plannedDate": "2022-01-15T00:00:00Z",
//   "startDate": "2022-06-01T00:00:00Z",
//   "completedDate": "2023-02-10T00:00:00Z",
//   "sourceUrl": "https://gov.example/phc-report",
//   "createdAt": "2022-01-15T10:00:00Z",
//   "updatedAt": "2023-02-10T18:30:00Z"
// }
