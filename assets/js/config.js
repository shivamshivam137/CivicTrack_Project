// ------------------------------------
// Homepage Button Navigation Logic
// No Firebase – simple redirects
// ------------------------------------

document.getElementById("loginBtn").addEventListener("click", () => {
    // Redirect to login page (can be created later)
    window.location.href = "login.html";
});

document.getElementById("signupBtn").addEventListener("click", () => {
    // Redirect to signup page (can be created later)
    window.location.href = "register.html";
});

document.getElementById("exploreBtn").addEventListener("click", () => {
    // Redirect to public candidates listing
    window.location.href = "candidates.html";
});
