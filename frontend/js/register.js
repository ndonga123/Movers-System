/* ============================================
   register.js — Account Registration
   IoT Movers System
   ============================================ */

const API = "https://movers-system.onrender.com/api/auth";

async function register() {
  const name     = document.getElementById("name").value.trim();
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role     = document.getElementById("role").value;
  const btn      = document.querySelector(".btn-login");

  if (!name || !email || !password) {
    showMsg("Please fill in all fields", true);
    return;
  }

  if (password.length < 6) {
    showMsg("Password must be at least 6 characters", true);
    return;
  }

  btn.textContent = "Creating account...";
  btn.disabled    = true;

  try {
    const res  = await fetch(`${API}/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();

    if (!res.ok) {
      showMsg(data.error || "Registration failed", true);
      return;
    }

    // Save token and user info
    localStorage.setItem("token",    data.token);
    localStorage.setItem("auth",     "true");
    localStorage.setItem("role",     data.user.role);
    localStorage.setItem("userName", data.user.name);
    localStorage.setItem("email",    data.user.email);

    showMsg("✓ Account created! Redirecting...", false);
    setTimeout(() => { location.href = "dashboard.html"; }, 800);

  } catch (err) {
    console.error("Register error:", err);
    showMsg("Network error — try again", true);
  } finally {
    btn.disabled    = false;
    btn.textContent = "Create Account →";
  }
}

function showMsg(text, isError) {
  const msg     = document.getElementById("msg");
  msg.textContent = text;
  msg.className   = "login-msg" + (isError ? " error" : " success");
}

// Enter key support
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("password").addEventListener("keydown", e => {
    if (e.key === "Enter") register();
  });
});