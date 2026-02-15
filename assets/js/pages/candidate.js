/**
 * Candidate Page - List & Detail View
 * Enhanced with detailed profile information, promises, feedback
 */

import { 
  getAllCandidates, 
  getCandidateById,
  calculateFulfillmentPercentage,
  calculateFundUtilization
} from "../firestore/candidates.js";

import { 
  getPromisesByCandidate 
} from "../firestore/promises.js";

import {
  getFeedbackByCandidate,
  getCandidateFeedbackSummary
} from "../firestore/feedback.js";

// DOM Elements
const candidateListView = document.getElementById("candidateListView");
const candidateDetailView = document.getElementById("candidateDetailView");
const candidatesContainer = document.getElementById("candidatesContainer");
const backToListBtn = document.getElementById("backToListBtn");
const compareBtn = document.getElementById("compareBtn");

// Search & Filter Elements
const searchName = document.getElementById("searchName");
const searchParty = document.getElementById("searchParty");
const searchConstituency = document.getElementById("searchConstituency");

// Tab Elements
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

let allCandidates = [];

/* ==========================
   Helper: Format Currency
========================== */
function formatCurrency(value) {
  const num = parseInt(value) || 0;
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1) + " Cr";
  } else if (num >= 100000) {
    return (num / 100000).toFixed(1) + " Lakh";
  }
  return num.toLocaleString("en-IN");
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
   Helper: Validate Image URL
========================== */
function getImageUrl(candidate) {
  if (candidate.profileImage && typeof candidate.profileImage === "string") {
    return candidate.profileImage;
  }
  // Fallback to placeholder
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e8eaed' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='60' font-weight='bold' text-anchor='middle' dominant-baseline='middle' fill='%239aa0a6'%3E%3F%3C/text%3E%3C/svg%3E";
}

/* ==========================
   Render Candidate Cards (List View)
========================== */
async function renderCandidateCards(candidates) {
  if (candidates.length === 0) {
    candidatesContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
        <p style="font-size: 1.1rem;">No candidates found matching your search.</p>
      </div>
    `;
    return;
  }

  candidatesContainer.innerHTML = "";

  for (const candidate of candidates) {
    const fulfillment = calculateFulfillmentPercentage(candidate);

    const card = document.createElement("div");
    card.className = "card";
    card.style.cssText = "cursor: pointer; transition: var(--transition);";
    card.onmouseover = () => card.style.boxShadow = "var(--shadow-lg)";
    card.onmouseout = () => card.style.boxShadow = "var(--shadow)";

    card.innerHTML = `
      <img src="${getImageUrl(candidate)}" alt="${escapeHtml(candidate.name)}" 
        style="width: 100%; height: 180px; object-fit: cover; border-radius: var(--radius); margin-bottom: 1rem;">
      <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem;">${escapeHtml(candidate.name || "Unnamed")}</h3>
      <p style="margin: 0.25rem 0; color: var(--text-secondary); font-size: 0.95rem;">
        <strong>${escapeHtml(candidate.party || "Independent")}</strong>
      </p>
      <p style="margin: 0.25rem 0; color: var(--text-secondary); font-size: 0.85rem;">
        ${candidate.constituency ? `📍 ${escapeHtml(candidate.constituency)}` : ""}
      </p>
      <div style="margin: 1rem 0; padding: 0.75rem; background: var(--bg-light); border-radius: var(--radius); text-align: center;">
        <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">
          <strong>${fulfillment}%</strong> Promise Fulfillment
        </p>
      </div>
      <button class="btn btn-primary" style="width: 100%; margin-top: 0.75rem;">View Profile</button>
    `;

    card.addEventListener("click", () => showDetailView(candidate.id));
    candidatesContainer.appendChild(card);
  }
}

/* ==========================
   Filter and Search
========================== */
function applyFilters() {
  const nameFilter = searchName.value.toLowerCase();
  const partyFilter = searchParty.value.toLowerCase();
  const constituencyFilter = searchConstituency.value.toLowerCase();

  const filtered = allCandidates.filter(c => {
    const nameMatch = (c.name || "").toLowerCase().includes(nameFilter);
    const partyMatch = (c.party || "").toLowerCase().includes(partyFilter);
    const constituencyMatch = (c.constituency || "").toLowerCase().includes(constituencyFilter);

    return nameMatch && partyMatch && constituencyMatch;
  });

  renderCandidateCards(filtered);
}

searchName.addEventListener("input", applyFilters);
searchParty.addEventListener("input", applyFilters);
searchConstituency.addEventListener("input", applyFilters);

/* ==========================
   Show Candidate Detail View
========================== */
async function showDetailView(candidateId) {
  const candidate = await getCandidateById(candidateId);

  if (!candidate) {
    alert("Candidate not found");
    return;
  }

  // Populate basic info
  document.getElementById("candidateName").textContent = candidate.name || "Unknown";
  document.getElementById("candidateParty").textContent = candidate.party || "Independent";
  document.getElementById("candidateConstituency").textContent = candidate.constituency || "Not specified";
  document.getElementById("candidateEducation").textContent = candidate.education || "Not provided";
  document.getElementById("candidateImage").src = getImageUrl(candidate);
  document.getElementById("candidateImage").onerror = () => {
    document.getElementById("candidateImage").src = getImageUrl({});
  };

  // Populate financial info
  const assets = candidate.assets?.total || candidate.fundsAllocated || 0;
  const liabilities = candidate.liabilities?.total || 0;
  const netWorth = assets - liabilities;

  document.getElementById("candidateAssets").textContent = formatCurrency(assets);
  document.getElementById("candidateLiabilities").textContent = formatCurrency(liabilities);
  document.getElementById("netWorth").textContent = formatCurrency(netWorth);
  document.getElementById("transparencyScore").textContent = (candidate.transparencyScore || 0) + "%";

  // Populate funds
  document.getElementById("fundsAllocated").textContent = formatCurrency(candidate.fundsAllocated || 0);
  document.getElementById("fundsUtilized").textContent = formatCurrency(candidate.fundsUtilized || 0);
  const fundUtil = calculateFundUtilization(candidate);
  document.getElementById("fundUtilDisplay").textContent = fundUtil + "%";

  // Populate criminal cases
  const criminalCasesList = document.getElementById("criminalCasesList");
  criminalCasesList.innerHTML = "";
  if (candidate.criminalCases && Array.isArray(candidate.criminalCases) && candidate.criminalCases.length > 0) {
    candidate.criminalCases.forEach(caseItem => {
      const li = document.createElement("li");
      li.textContent = escapeHtml(caseItem);
      criminalCasesList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.style.color = "#4caf50";
    li.textContent = "✓ No criminal cases recorded";
    criminalCasesList.appendChild(li);
  }

  // Populate promise stats
  const fulfillment = calculateFulfillmentPercentage(candidate);
  document.getElementById("promisesTotal").textContent = candidate.promisesTotal || 0;
  document.getElementById("promisesCompleted").textContent = candidate.promisesCompleted || 0;
  document.getElementById("fulfillmentRate").textContent = fulfillment + "%";
  document.getElementById("promiseStat").textContent = candidate.promisesTotal || 0;
  document.getElementById("completionStat").textContent = fulfillment + "%";
  document.getElementById("fundUtilStat").textContent = fundUtil + "%";

  // Populate past performance
  document.getElementById("pastPerformance").textContent = candidate.pastPerformance || "Not provided";

  // Populate political history
  const politicalHistoryList = document.getElementById("politicalHistoryList");
  politicalHistoryList.innerHTML = "";
  if (candidate.politicalHistory && Array.isArray(candidate.politicalHistory) && candidate.politicalHistory.length > 0) {
    candidate.politicalHistory.forEach(item => {
      const li = document.createElement("li");
      li.textContent = escapeHtml(item);
      politicalHistoryList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.style.color = "var(--text-secondary)";
    li.textContent = "No political history recorded";
    politicalHistoryList.appendChild(li);
  }

  // Load and display promises
  await loadAndDisplayPromises(candidateId);

  // Load and display feedback
  await loadAndDisplayFeedback(candidateId);

  // Show detail view
  candidateListView.style.display = "none";
  candidateDetailView.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==========================
   Load and Display Promises
========================== */
async function loadAndDisplayPromises(candidateId) {
  try {
    const promises = await getPromisesByCandidate(candidateId);
    const container = document.getElementById("promisesContainer");

    if (!promises || promises.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          <p>No promises recorded for this candidate.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    promises.forEach(promise => {
      const statusClass = `promise-status ${promise.status || "planned"}`;
      const percentage = promise.completionPercentage || 0;

      const item = document.createElement("div");
      item.className = "promise-item";
      item.innerHTML = `
        <h4>
          ${escapeHtml(promise.title || "Untitled Promise")}
          <span class="${statusClass}">${promise.status || "planned"}</span>
        </h4>
        ${promise.description ? `<p style="margin: 0.5rem 0; color: var(--text-secondary);">${escapeHtml(promise.description)}</p>` : ""}
        ${promise.category ? `<p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">Category: ${escapeHtml(promise.category)}</p>` : ""}
        <div class="promise-progress">
          <div class="promise-progress-bar" style="width: ${percentage}%;"></div>
        </div>
        <p style="margin: 0.5rem 0; font-size: 0.9rem; color: var(--text-secondary);">
          <strong>${percentage}% Complete</strong>
        </p>
        ${promise.proofLinks && promise.proofLinks.length > 0 ? `
          <p style="margin: 0.5rem 0; font-size: 0.9rem;">
            <strong>Proof Links:</strong> 
            ${promise.proofLinks.map((link, idx) => `<a href="${escapeHtml(link)}" target="_blank" rel="noopener" style="color: var(--primary-color);">Link ${idx + 1}</a>`).join(", ")}
          </p>
        ` : ""}
      `;

      container.appendChild(item);
    });
  } catch (error) {
    console.error("Error loading promises:", error);
    document.getElementById("promisesContainer").innerHTML = `
      <div style="color: var(--danger-color); padding: 1rem;">Error loading promises. Please try again.</div>
    `;
  }
}

/* ==========================
   Load and Display Feedback
========================== */
async function loadAndDisplayFeedback(candidateId) {
  try {
    const feedbacks = await getFeedbackByCandidate(candidateId);
    const summary = await getCandidateFeedbackSummary(candidateId);
    const container = document.getElementById("feedbackContainer");

    // Update summary
    document.getElementById("averageRating").textContent = summary.averageRating.toFixed(1);
    document.getElementById("feedbackCount").textContent = summary.totalFeedback;
    document.getElementById("feedbackStat").textContent = summary.totalFeedback;

    if (!feedbacks || feedbacks.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          <p>No feedback yet. Be the first to share your thoughts about this candidate!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    feedbacks.forEach(feedback => {
      const item = document.createElement("div");
      item.className = "feedback-item";

      const stars = "★".repeat(feedback.rating || 0) + "☆".repeat(5 - (feedback.rating || 0));

      item.innerHTML = `
        <div class="feedback-header">
          <span class="feedback-author">${escapeHtml(feedback.userName || "Anonymous")}</span>
          <span class="feedback-rating">${stars}</span>
        </div>
        <p class="feedback-text">${escapeHtml(feedback.feedbackText || "")}</p>
        ${feedback.isPositive !== null ? `
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.5rem 0 0 0;">
            Sentiment: <strong>${feedback.isPositive ? "Positive" : "Negative"}</strong>
          </p>
        ` : ""}
      `;

      container.appendChild(item);
    });
  } catch (error) {
    console.error("Error loading feedback:", error);
  }
}

/* ==========================
   Tab Navigation
========================== */
tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    const tabName = button.dataset.tab;

    // Deactivate all tabs
    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));

    // Activate clicked tab
    button.classList.add("active");
    document.getElementById(tabName).classList.add("active");
  });
});

/* ==========================
   Back to List Button
========================== */
backToListBtn.addEventListener("click", () => {
  candidateDetailView.style.display = "none";
  candidateListView.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ==========================
   Compare Button
========================== */
compareBtn.addEventListener("click", () => {
  window.location.href = "campare.html";
});

/* ==========================
   Initialize - Load Candidates
========================== */
async function init() {
  try {
    allCandidates = await getAllCandidates();
    
    // If no candidates exist, show helpful message
    if (allCandidates.length === 0) {
      candidatesContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
          <p style="font-size: 1.25rem; margin-bottom: 1rem;">📋 No candidates found</p>
          <p>The candidate database is currently empty.</p>
          <p style="font-size: 0.95rem; margin-top: 1rem; color: var(--text-disabled);">
            Please ask your administrator to add candidate information to get started.
          </p>
          <a href="index.html" class="btn btn-primary" style="margin-top: 1.5rem;">Back to Home</a>
        </div>
      `;
      return;
    }
    
    renderCandidateCards(allCandidates);
  } catch (error) {
    console.error("Error initializing:", error);
    candidatesContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--danger-color);">
        <p>⚠️ Error loading candidates</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Check browser console for details</p>
        <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">Retry</button>
      </div>
    `;
  }
}

init();


