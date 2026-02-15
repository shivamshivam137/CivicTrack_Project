// /assets/js/utils/formatters.js
// Formatting helpers for display and export
// Pure functions - no dependencies

/**
 * Format currency (INR)
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) return "₹0";
  const num = Number(value);
  if (isNaN(num)) return "₹0";
  return "₹" + num.toLocaleString("en-IN");
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return "0%";
  const num = Number(value);
  if (isNaN(num)) return "0%";
  return num.toFixed(decimals) + "%";
}

/**
 * Format date to readable string
 */
export function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  
  try {
    // Handle Firestore Timestamp objects
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch (error) {
    console.error("formatDate error:", error);
    return "N/A";
  }
}

/**
 * Format date and time
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return "N/A";
  
  try {
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (error) {
    console.error("formatDateTime error:", error);
    return "N/A";
  }
}

/**
 * Format promise status for display
 */
export function formatPromiseStatus(status) {
  const statusMap = {
    "fulfilled": "✓ Fulfilled",
    "partial": "~ Partially Fulfilled",
    "pending": "○ Pending"
  };
  return statusMap[status] || status;
}

/**
 * Format report type for display
 */
export function formatReportType(type) {
  const typeMap = {
    "criminal": "Criminal Record",
    "asset": "Asset Declaration",
    "performance": "Performance Report"
  };
  return typeMap[type] || type;
}

/**
 * Format role for display
 */
export function formatRole(role) {
  const roleMap = {
    "user": "User",
    "admin": "Administrator"
  };
  return roleMap[role] || role;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Format candidate score/rating
 */
export function formatScore(score) {
  if (score === null || score === undefined) return "N/A";
  const num = Number(score);
  if (isNaN(num)) return "N/A";
  return num.toFixed(1) + "/10";
}

/**
 * Format numbers with commas
 */
export function formatNumber(value) {
  if (value === null || value === undefined) return "0";
  const num = Number(value);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-IN");
}

/**
 * Format promise completion ratio
 */
export function formatPromiseRatio(completed, total) {
  if (total === 0) return "0/0";
  return `${completed}/${total}`;
}

/**
 * Get status badge class for styling
 */
export function getStatusBadgeClass(status) {
  const classMap = {
    "fulfilled": "badge-success",
    "partial": "badge-warning",
    "pending": "badge-info",
    "true": "badge-success",
    "false": "badge-danger"
  };
  return classMap[status] || "badge-default";
}
