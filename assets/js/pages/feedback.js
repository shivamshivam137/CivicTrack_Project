/**
 * Public Feedback Page
 * Displays verified public feedback on candidates with filtering
 */

import { getAllCandidates } from "../firestore/candidates.js";
import { getAllFeedback, getFeedbackByCandidate, getCandidateFeedbackSummary } from "../firestore/feedback.js";

const feedbackContainer = document.getElementById("feedbackContainer");
const candidateFilter = document.getElementById("candidateFilter");
const ratingFilter = document.getElementById("ratingFilter");

let allFeedback = [];
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
   Helper: Star Rating Display
========================== */
function getStarRating(rating) {
  const num = rating || 0;
  return "★".repeat(num) + "☆".repeat(5 - num);
}

/* ==========================
   Load Data
========================== */
async function loadData() {
  try {
    allFeedback = await getAllFeedback();
    allCandidates = await getAllCandidates();

    // Populate candidate filter dropdown
    populateCandidateFilter();

    // Initial render
    applyFilters();
  } catch (error) {
    console.error("Error loading feedback:", error);
    feedbackContainer.innerHTML = `
      <div class="empty-feedback">
        <p style="color: var(--danger-color);">Error loading feedback. Please try again.</p>
      </div>
    `;
  }
}

/* ==========================
   Populate Candidate Filter Dropdown
========================== */
function populateCandidateFilter() {
  // Get unique candidates from feedback
  const candidateIds = new Set(allFeedback.map(f => f.candidateId).filter(Boolean));
  const candidates = allCandidates.filter(c => candidateIds.has(c.id));

  candidates.forEach(candidate => {
    const option = document.createElement("option");
    option.value = candidate.id;
    option.textContent = `${candidate.name} (${candidate.party || "Independent"})`;
    candidateFilter.appendChild(option);
  });
}

/* ==========================
   Apply Filters and Render
========================== */
function applyFilters() {
  const selectedCandidate = candidateFilter.value;
  const selectedRating = ratingFilter.value ? parseInt(ratingFilter.value) : 0;

  // Filter feedback
  let filtered = allFeedback.filter(feedback => {
    const candidateMatch = !selectedCandidate || feedback.candidateId === selectedCandidate;
    const ratingMatch = !selectedRating || (feedback.rating || 0) >= selectedRating;
    return candidateMatch && ratingMatch;
  });

  renderFeedbackGrouped(filtered);
}

/* ==========================
   Render Feedback Grouped by Candidate
========================== */
async function renderFeedbackGrouped(feedback) {
  if (feedback.length === 0) {
    feedbackContainer.innerHTML = `
      <div class="empty-feedback">
        <p>No feedback found matching your filters.</p>
      </div>
    `;
    return;
  }

  // Group by candidate
  const grouped = {};
  feedback.forEach(item => {
    const candidateId = item.candidateId || "unknown";
    if (!grouped[candidateId]) {
      grouped[candidateId] = [];
    }
    grouped[candidateId].push(item);
  });

  feedbackContainer.innerHTML = "";

  // Render each candidate's feedback
  for (const [candidateId, candidateFeedback] of Object.entries(grouped)) {
    const candidate = allCandidates.find(c => c.id === candidateId);
    const candidateName = candidate ? candidate.name : "Unknown Candidate";
    const party = candidate ? candidate.party : "Independent";

    // Get feedback summary
    const summary = await getCandidateFeedbackSummary(candidateId);

    const section = document.createElement("div");
    section.className = "candidate-feedback-section";

    // Header with candidate info and rating
    const header = document.createElement("div");
    header.className = "candidate-header";
    header.innerHTML = `
      <div>
        <h3>${escapeHtml(candidateName)}</h3>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem;">Party: ${escapeHtml(party)}</p>
      </div>
      <div class="candidate-rating">
        <span class="rating-number">${summary.averageRating.toFixed(1)}/5.0</span>
        <span class="rating-label">${getStarRating(Math.round(summary.averageRating))}</span>
      </div>
    `;
    section.appendChild(header);

    // Feedback statistics
    const stats = document.createElement("div");
    stats.className = "feedback-stats";
    stats.innerHTML = `
      <div class="stat-item">
        <span class="stat-value">${summary.totalFeedback}</span>
        <span class="stat-label">Total Reviews</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${summary.positiveCount}</span>
        <span class="stat-label" style="color: #4caf50;">Positive</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${summary.negativeCount}</span>
        <span class="stat-label" style="color: #f44336;">Negative</span>
      </div>
    `;
    section.appendChild(stats);

    // Feedback items
    const feedbackList = document.createElement("div");
    feedbackList.className = "feedback-list";

    candidateFeedback.forEach(item => {
      const feedbackCard = document.createElement("div");
      feedbackCard.className = "feedback-item";

      const sentiment = item.isPositive !== null
        ? `<span class="feedback-sentiment ${item.isPositive ? "sentiment-positive" : "sentiment-negative"}">${item.isPositive ? "Positive" : "Negative"}</span>`
        : "";

      feedbackCard.innerHTML = `
        <div class="feedback-item-header">
          <div>
            <span class="feedback-author">${escapeHtml(item.userName || "Anonymous")}</span>
            <span class="feedback-stars">${getStarRating(item.rating || 0)}</span>
          </div>
          ${sentiment}
        </div>
        <p class="feedback-text">${escapeHtml(item.feedbackText || "")}</p>
      `;

      feedbackList.appendChild(feedbackCard);
    });

    section.appendChild(feedbackList);
    feedbackContainer.appendChild(section);
  }
}

/* ==========================
   Filter Event Listeners
========================== */
candidateFilter.addEventListener("change", applyFilters);
ratingFilter.addEventListener("change", applyFilters);

/* ==========================
   Initialize
========================== */
loadData();
