// /assets/js/pages/home.js
// Home page navigation logic
// No Firebase, auth, or role logic

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const viewCandidatesBtn = document.getElementById("viewCandidatesBtn");
  const compareBtn = document.getElementById("compareBtn");
  const exploreBtn = document.getElementById("exploreBtn");
  const learnMoreBtn = document.getElementById("learnMoreBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
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
      window.location.href = "campare.html";
    });
  }

  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      window.location.href = "candidate.html";
    });
  }

  if (learnMoreBtn) {
    learnMoreBtn.addEventListener("click", () => {
      window.location.href = "about.html";
    });
  }
});


