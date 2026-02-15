
// Home page navigation logic
// No Firebase logic is used here

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const viewCandidatesBtn = document.getElementById("viewCandidatesBtn");
  const compareBtn = document.getElementById("compareBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      window.location.href = "register.html";
    });
  }

  if (viewCandidatesBtn) {
    viewCandidatesBtn.addEventListener("click", () => {
      window.location.href = "candidate.html";
    });
  }

  if (compareBtn) {
    compareBtn.addEventListener("click", () => {
      window.location.href = "compare.html";
    });
  }
});

// ======================================================================================
// // Home page navigation logic
// // No Firebase logic is used here

// document.getElementById("loginBtn").addEventListener("click", () => {
//   window.location.href = "login.html";
// });

// document.getElementById("registerBtn").addEventListener("click", () => {
//   window.location.href = "register.html";
// });

// document.getElementById("viewCandidatesBtn").addEventListener("click", () => {
//   window.location.href = "candidate.html";
// });

// document.getElementById("compareBtn").addEventListener("click", () => {
//   window.location.href = "compare.html";
// });
