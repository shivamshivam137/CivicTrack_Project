// /assets/js/utils/constants.js
// Global constants and configuration
// No dependencies on Firebase or DOM

/**
 * Application constants
 */
export const APP_NAME = "NagrikNeeti";
export const APP_DESCRIPTION = "Civic Awareness & Political Transparency Platform";

/**
 * Routes
 */
export const ROUTES = {
  // Public
  HOME: "/public/index.html",
  LOGIN: "/public/login.html",
  REGISTER: "/public/register.html",
  DASHBOARD: "/public/dashboard.html",
  CANDIDATE: "/public/candidate.html",
  COMPARE: "/public/campare.html",
  PROMISES: "/public/promises.html",
  REPORTS: "/public/reports.html",
  ABOUT: "/public/about.html",
  PRIVACY: "/public/privacy.html",
  NOT_FOUND: "/public/404.html",
  
  // Admin
  ADMIN_LOGIN: "/admin/admin-login.html",
  ADMIN_DASHBOARD: "/admin/admin-dashboard.html",
  ADD_CANDIDATE: "/admin/add-candidate.html",
  EDIT_CANDIDATE: "/admin/edit-candidate.html",
  VERIFY_DATA: "/admin/verify-data.html",
  MANAGE_USERS: "/admin/manage-users.html",
  ANALYTICS: "/admin/analytics.html"
};

/**
 * User roles
 */
export const ROLES = {
  USER: "user",
  ADMIN: "admin"
};

/**
 * Promise statuses
 */
export const PROMISE_STATUS = {
  FULFILLED: "fulfilled",
  PARTIAL: "partial",
  PENDING: "pending"
};

/**
 * Report types
 */
export const REPORT_TYPE = {
  CRIMINAL: "criminal",
  ASSET: "asset",
  PERFORMANCE: "performance"
};

/**
 * Candidate fields
 */
export const CANDIDATE_FIELDS = {
  name: "Name",
  party: "Party",
  constituency: "Constituency",
  education: "Education",
  criminalCases: "Criminal Cases",
  assets: "Assets (₹)",
  liabilities: "Liabilities (₹)",
  imageUrl: "Profile Image",
  verified: "Verified"
};

/**
 * Common Indian political parties
 */
export const PARTIES = [
  "Indian National Congress",
  "Bharatiya Janata Party",
  "Samajwadi Party",
  "Dravida Munnetra Kazhagam",
  "All India Anna Dravida Munnetra Kazhagam",
  "Trinamool Congress",
  "Shiv Sena",
  "Nationalist Congress Party",
  "Biju Janata Dal",
  "Aam Aadmi Party",
  "Independent"
];

/**
 * Education levels
 */
export const EDUCATION_LEVELS = [
  "Below 10th",
  "10th Pass",
  "12th Pass",
  "Bachelor's Degree",
  "Master's Degree",
  "Ph.D.",
  "Professional Degree (Law, Medical, Engineering)"
];

/**
 * Validation rules
 */
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 5000
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  CURRENT_USER: "nagrikneeti_user",
  AUTH_TOKEN: "nagrikneeti_token",
  PREFERENCES: "nagrikneeti_prefs"
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to access this page.",
  NOT_LOGGED_IN: "Please log in to continue.",
  INVALID_EMAIL: "Invalid email address.",
  WEAK_PASSWORD: "Password must be at least 6 characters with a number.",
  USER_NOT_FOUND: "User account not found.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  NETWORK_ERROR: "Network error. Please try again.",
  FIREBASE_ERROR: "An error occurred. Please try again."
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  REGISTERED: "Registration successful! Please log in.",
  LOGGED_IN: "Logged in successfully.",
  LOGGED_OUT: "Logged out successfully.",
  CREATED: "Created successfully.",
  UPDATED: "Updated successfully.",
  DELETED: "Deleted successfully."
};

/**
 * Page titles
 */
export const PAGE_TITLES = {
  HOME: "NagrikNeeti | Civic Awareness Platform",
  LOGIN: "NagrikNeeti | Login",
  REGISTER: "NagrikNeeti | Register",
  DASHBOARD: "NagrikNeeti | Dashboard",
  CANDIDATE: "NagrikNeeti | Candidate Profile",
  COMPARE: "NagrikNeeti | Compare Candidates",
  PROMISES: "NagrikNeeti | Election Promises",
  REPORTS: "NagrikNeeti | Reports & Verification",
  ABOUT: "NagrikNeeti | About Us",
  PRIVACY: "NagrikNeeti | Privacy Policy",
  NOT_FOUND: "NagrikNeeti | Not Found",
  ADMIN_LOGIN: "NagrikNeeti Admin | Login",
  ADMIN_DASHBOARD: "NagrikNeeti Admin | Dashboard",
  ADD_CANDIDATE: "NagrikNeeti Admin | Add Candidate",
  EDIT_CANDIDATE: "NagrikNeeti Admin | Edit Candidate",
  VERIFY_DATA: "NagrikNeeti Admin | Verify Data",
  MANAGE_USERS: "NagrikNeeti Admin | Manage Users",
  ANALYTICS: "NagrikNeeti Admin | Analytics"
};
