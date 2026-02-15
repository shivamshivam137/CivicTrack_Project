/**
 * Global Validators Utility
 * --------------------------------
 * Goals:
 * - Reusable across ALL forms (public + admin)
 * - Defensive: never crash UI
 * - Pure validation logic (no Firebase, no DOM mutation required)
 * - Optional helpers for safe DOM error rendering
 */

/* ===============================
   BASIC VALUE CHECKS
================================ */

/**
 * Safely normalize any input to string
 */
function toStringSafe(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

/**
 * Required field validator
 */
export function isRequired(value) {
  return toStringSafe(value).length > 0;
}

/**
 * Minimum length validator
 */
export function minLength(value, min) {
  const v = toStringSafe(value);
  return v.length >= min;
}

/**
 * Maximum length validator
 */
export function maxLength(value, max) {
  const v = toStringSafe(value);
  return v.length <= max;
}

/* ===============================
   FORMAT VALIDATORS
================================ */

/**
 * Email format validator
 */
export function isValidEmail(value) {
  const v = toStringSafe(value);
  if (!v) return false;

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(v);
}

/**
 * Password strength validator
 * - Minimum 6 characters
 * - At least one number
 */
export function isStrongPassword(value) {
  const v = toStringSafe(value);
  if (v.length < 6) return false;

  const numberRegex = /\d/;
  return numberRegex.test(v);
}

/**
 * Alphanumeric (safe IDs, names)
 */
export function isAlphaNumeric(value) {
  const v = toStringSafe(value);
  return /^[a-z0-9 ]+$/i.test(v);
}

/* ===============================
   ENUM / STATUS VALIDATION
================================ */

/**
 * Validate value against allowed list
 */
export function isOneOf(value, allowed = []) {
  if (!Array.isArray(allowed)) return false;
  return allowed.includes(value);
}

/* ===============================
   NUMBER VALIDATORS
================================ */

/**
 * Safe integer validation
 */
export function isValidInteger(value) {
  if (value === "" || value === null || value === undefined) return false;
  const num = Number(value);
  return Number.isInteger(num);
}

/**
 * Range validation (inclusive)
 */
export function isInRange(value, min, max) {
  const num = Number(value);
  if (Number.isNaN(num)) return false;
  return num >= min && num <= max;
}

/* ===============================
   FORM-LEVEL VALIDATION
================================ */

/**
 * Validate form fields using rules map
 *
 * Example:
 * validateForm({
 *   email: { value, rules: ["required", "email"] },
 *   password: { value, rules: ["required", "strongPassword"] }
 * })
 */
export function validateForm(fields = {}) {
  const errors = {};

  try {
    Object.entries(fields).forEach(([key, config]) => {
      if (!config || !Array.isArray(config.rules)) return;

      const value = config.value;

      config.rules.forEach(rule => {
        if (rule === "required" && !isRequired(value)) {
          errors[key] = "This field is required.";
        }

        if (rule === "email" && !isValidEmail(value)) {
          errors[key] = "Invalid email address.";
        }

        if (rule === "strongPassword" && !isStrongPassword(value)) {
          errors[key] = "Password is too weak.";
        }
      });
    });
  } catch (err) {
    console.error("Form validation error:", err);
  }

  return errors;
}

/* ===============================
   UI-SAFE ERROR HELPERS (OPTIONAL)
================================ */

/**
 * Safely display error text if element exists
 */
export function showError(elementId, message) {
  try {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message || "";
  } catch (err) {
    console.warn("showError failed:", err);
  }
}

/**
 * Clear error safely
 */
export function clearError(elementId) {
  showError(elementId, "");
}
