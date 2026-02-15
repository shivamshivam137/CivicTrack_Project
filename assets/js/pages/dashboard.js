// /assets/js/pages/dashboard.js
// Dashboard page - displays analytics and civic insights
// Protected: redirect to login if not authenticated

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { auth } from "../../../firebase/firebase-config.js";
import { getAllCandidates, calculateFulfillmentPercentage, calculateFundUtilization } from "../firestore/candidates.js";
import { getAllPromises } from "../firestore/promises.js";
import { getUserById } from "../firestore/users.js";
import { formatDate, formatDateTime } from "../utils/formatters.js";

/* ==========================
   Helper: Format Currency
========================== */
function formatCurrency(value) {
  const num = parseInt(value) || 0;
  if (num >= 10000000) return "₹" + (num / 10000000).toFixed(1) + " Cr";
  else if (num >= 100000) return "₹" + (num / 100000).toFixed(1) + " Lakh";
  return "₹" + num.toLocaleString("en-IN");
}

/* ==========================
   Display User Information
========================== */
async function displayUserInfo(user) {
  try {
    const userData = await getUserById(user.uid);

    const userNameEl = document.getElementById("userName");
    const userEmailEl = document.getElementById("userEmail");
    const accountCreatedEl = document.getElementById("accountCreated");
    const userRoleEl = document.getElementById("userRole");
    const userNameDisplay = document.getElementById("userNameDisplay");

    const userName = userData?.name || user.displayName || "Guest User";
    const userEmail = user.email || "No email provided";
    const userRole = userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : "Citizen";
    const createdDate = userData?.createdAt ? formatDateTime(userData.createdAt) : "N/A";

    if (userNameEl) userNameEl.textContent = userName;
    if (userNameDisplay) userNameDisplay.textContent = userName;
    if (userEmailEl) userEmailEl.textContent = userEmail;
    if (userRoleEl) userRoleEl.textContent = userRole;
    if (accountCreatedEl) accountCreatedEl.textContent = createdDate;
  } catch (error) {
    console.error("Error displaying user info:", error);
    throw error;
  }
}

/* ==========================
   Load and Display Analytics
========================== */
async function loadAnalytics() {
  try {
    const candidates = await getAllCandidates();
    const promises = await getAllPromises();

    // Calculate aggregates
    const totalCandidates = candidates.length;
    const totalPromises = promises.length;
    
    let totalFulfillmentPercentage = 0;
    let totalFundsAllocated = 0;
    let totalFundsUtilized = 0;

    if (candidates.length > 0) {
      candidates.forEach(candidate => {
        const fulfillment = calculateFulfillmentPercentage(candidate) || 0;
        totalFulfillmentPercentage += fulfillment;
        
        const allocated = parseInt(candidate.fundsAllocated) || 0;
        const utilized = parseInt(candidate.fundsUtilized) || 0;
        totalFundsAllocated += allocated;
        totalFundsUtilized += utilized;
      });
      
      totalFulfillmentPercentage = Math.round(totalFulfillmentPercentage / candidates.length);
    }

    // Update stat cards
    document.getElementById("totalCandidates").textContent = totalCandidates;
    document.getElementById("totalPromises").textContent = totalPromises;
    document.getElementById("promisesCompleted").textContent = totalFulfillmentPercentage + "%";
    document.getElementById("fundsTotalUtilized").textContent = formatCurrency(totalFundsUtilized);

    // Render visualizations
    renderPromiseFulfillmentChart(candidates);
    renderFundAllocationChart(candidates);
    renderTopCandidates(candidates);

  } catch (error) {
    console.error("Error loading analytics:", error);
  }
}

/* ==========================
   Render Promise Fulfillment Chart
========================== */
function renderPromiseFulfillmentChart(candidates) {
  const container = document.getElementById("promiseFulfillmentChart");
  
  if (!container || candidates.length === 0) {
    if (container) container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No data available</p>';
    return;
  }

  const sorted = candidates
    .filter(c => calculateFulfillmentPercentage(c) > 0)
    .sort((a, b) => (calculateFulfillmentPercentage(b) || 0) - (calculateFulfillmentPercentage(a) || 0))
    .slice(0, 8);

  let chartHTML = '<div style="overflow-x: auto;">';
  chartHTML += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">';
  chartHTML += '<thead>';
  chartHTML += '<tr style="border-bottom: 2px solid var(--border-color);">';
  chartHTML += '<th style="padding: 1rem; text-align: left; font-weight: 600;">Candidate</th>';
  chartHTML += '<th style="padding: 1rem; text-align: center; font-weight: 600;">Fulfillment %</th>';
  chartHTML += '<th style="padding: 1rem; text-align: center; font-weight: 600;">Visual</th>';
  chartHTML += '</tr>';
  chartHTML += '</thead>';
  chartHTML += '<tbody>';

  sorted.forEach(candidate => {
    const fulfillment = calculateFulfillmentPercentage(candidate) || 0;
    chartHTML += '<tr style="border-bottom: 1px solid var(--border-color);">';
    chartHTML += `<td style="padding: 1rem; font-weight: 500;">${candidate.name || "Unknown"}</td>`;
    chartHTML += `<td style="padding: 1rem; text-align: center; font-weight: 600; color: var(--primary-color);">${fulfillment}%</td>`;
    chartHTML += `<td style="padding: 1rem;">
      <div style="background: linear-gradient(90deg, var(--success-color) ${fulfillment}%, var(--border-color) ${fulfillment}%); height: 24px; border-radius: 4px;"></div>
    </td>`;
    chartHTML += '</tr>';
  });

  chartHTML += '</tbody>';
  chartHTML += '</table>';
  chartHTML += '</div>';

  container.innerHTML = chartHTML;
}

/* ==========================
   Render Fund Allocation Chart
========================== */
function renderFundAllocationChart(candidates) {
  const container = document.getElementById("fundAllocationChart");
  
  if (!container || candidates.length === 0) {
    if (container) container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No data available</p>';
    return;
  }

  const sorted = candidates
    .filter(c => parseInt(c.fundsAllocated) > 0)
    .sort((a, b) => parseInt(b.fundsAllocated) - parseInt(a.fundsAllocated))
    .slice(0, 8);

  let chartHTML = '<div style="overflow-x: auto;">';
  chartHTML += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">';
  chartHTML += '<thead>';
  chartHTML += '<tr style="border-bottom: 2px solid var(--border-color);">';
  chartHTML += '<th style="padding: 1rem; text-align: left; font-weight: 600;">Candidate</th>';
  chartHTML += '<th style="padding: 1rem; text-align: right; font-weight: 600;">Allocated</th>';
  chartHTML += '<th style="padding: 1rem; text-align: right; font-weight: 600;">Utilized</th>';
  chartHTML += '<th style="padding: 1rem; text-align: center; font-weight: 600;">Utilization %</th>';
  chartHTML += '</tr>';
  chartHTML += '</thead>';
  chartHTML += '<tbody>';

  sorted.forEach(candidate => {
    const allocated = parseInt(candidate.fundsAllocated) || 0;
    const utilized = parseInt(candidate.fundsUtilized) || 0;
    const utilization = allocated > 0 ? Math.round((utilized / allocated) * 100) : 0;
    const statusColor = utilization > 80 ? 'var(--success-color)' : utilization > 50 ? 'var(--warning-color)' : 'var(--danger-color)';

    chartHTML += '<tr style="border-bottom: 1px solid var(--border-color);">';
    chartHTML += `<td style="padding: 1rem; font-weight: 500;">${candidate.name || "Unknown"}</td>`;
    chartHTML += `<td style="padding: 1rem; text-align: right;">${formatCurrency(allocated)}</td>`;
    chartHTML += `<td style="padding: 1rem; text-align: right;">${formatCurrency(utilized)}</td>`;
    chartHTML += `<td style="padding: 1rem; text-align: center; color: ${statusColor}; font-weight: 600;">${utilization}%</td>`;
    chartHTML += '</tr>';
  });

  chartHTML += '</tbody>';
  chartHTML += '</table>';
  chartHTML += '</div>';

  container.innerHTML = chartHTML;
}

/* ==========================
   Render Top Candidates
========================== */
function renderTopCandidates(candidates) {
  const container = document.getElementById("topCandidates");
  
  if (!container || candidates.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No candidates available</p>';
    return;
  }

  const sorted = candidates
    .sort((a, b) => (calculateFulfillmentPercentage(b) || 0) - (calculateFulfillmentPercentage(a) || 0))
    .slice(0, 5);

  let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">';

  sorted.forEach((candidate, index) => {
    const fulfillment = calculateFulfillmentPercentage(candidate) || 0;
    const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';

    html += `<div class="card" style="text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">${medalEmoji}</div>
      <h3 style="margin: 0.5rem 0; color: var(--primary-color);">${candidate.name || "Unknown"}</h3>
      <p style="margin: 0.25rem 0; color: var(--text-secondary); font-weight: 500;">${candidate.party || "Independent"}</p>
      <div style="margin: 1rem 0; padding: 1rem; background: var(--bg-light); border-radius: var(--radius);">
        <div style="font-size: 1.75rem; font-weight: 700; color: var(--success-color);">${fulfillment}%</div>
        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Promise Fulfillment</p>
      </div>
    </div>`;
  });

  html += '</div>';
  container.innerHTML = html;
}

/* ==========================
   Handle Logout
========================== */
function setupLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      
      try {
        logoutBtn.disabled = true;
        logoutBtn.textContent = "Logging out...";
        
        await signOut(auth);
        
        window.location.href = "login.html";
      } catch (error) {
        console.error("Logout error:", error);
        logoutBtn.disabled = false;
        logoutBtn.textContent = "Logout";
        alert("Error during logout. Please try again.");
      }
    });
  }
}

/* ==========================
   Initialize Dashboard
========================== */
function initializeDashboard() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      const loadingSpinner = document.getElementById("loadingSpinner");
      const dashboardContent = document.getElementById("dashboardContent");

      // Load both user info and analytics
      await displayUserInfo(user);
      await loadAnalytics();

      // Show content only after both are complete
      if (loadingSpinner) loadingSpinner.style.display = "none";
      if (dashboardContent) dashboardContent.style.display = "block";

      setupLogoutButton();
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      const loadingSpinner = document.getElementById("loadingSpinner");
      if (loadingSpinner) {
        loadingSpinner.innerHTML = '<p class="error-message" style="color: #d32f2f; padding: 20px;">Error loading dashboard. Please refresh the page.</p>';
      }
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDashboard);
} else {
  initializeDashboard();
}
