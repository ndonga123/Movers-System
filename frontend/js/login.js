/* ============================================
   login.js — Authentication
   IoT Movers System
   ============================================ */

let selectedRole = "admin";

function setRole(role, btn) {
  selectedRole = role;
  document.querySelectorAll(".login-role-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function login() {
  const u   = document.getElementById("user").value.trim();
  const p   = document.getElementById("pass").value.trim();
  const msg = document.getElementById("msg");
  const btn = document.querySelector(".btn-login");

  if (!u || !p) {
    showMsg("Please enter your username and password", true);
    return;
  }

  btn.textContent = "Signing in...";
  btn.disabled    = true;

  // Simulate brief loading then authenticate
  setTimeout(() => {
    if (u === "admin" && p === "1234") {
      localStorage.setItem("auth", "true");
      localStorage.setItem("role", selectedRole);
      localStorage.setItem("userName", u);
      showMsg("✓ Login successful — redirecting...", false);
      setTimeout(() => { location.href = "dashboard.html"; }, 800);
    } else {
      showMsg("Invalid username or password", true);
      btn.textContent = "Sign In →";
      btn.disabled    = false;
    }
  }, 600);
}

function showMsg(text, isError) {
  const msg = document.getElementById("msg");
  msg.textContent = text;
  msg.className   = "login-msg" + (isError ? " error" : " success");
}

// Allow Enter key to submit
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("pass").addEventListener("keydown", e => {
    if (e.key === "Enter") login();
  });
  document.getElementById("user").addEventListener("keydown", e => {
    if (e.key === "Enter") login();
  });
});