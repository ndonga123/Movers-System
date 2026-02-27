/* ============================================
   role-guard.js — Role-based UI restrictions
   IoT Movers System
   ============================================ */

(function() {
  const role     = localStorage.getItem("role")     || "farmer";
  const userName = localStorage.getItem("userName") || "User";

  // ── UPDATE SIDEBAR USER INFO ──
  const userNameEl    = document.getElementById("userName");
  const userRoleLabel = document.getElementById("userRoleLabel");
  const userAvatar    = document.getElementById("userAvatar");

  if (userNameEl)    userNameEl.textContent    = userName;
  if (userRoleLabel) userRoleLabel.textContent = roleLabel(role);
  if (userAvatar) {
    userAvatar.textContent      = userName.charAt(0).toUpperCase();
    userAvatar.style.background = roleColor(role);
    userAvatar.style.color      = "#111";
  }

  // ── HIDE ADD/EDIT/DELETE FOR FARMERS ONLY ──
  if (role === "farmer") {
    document.querySelectorAll("[data-role]").forEach(el => {
      const allowed = el.getAttribute("data-role").split(",").map(r => r.trim());
      if (!allowed.includes("farmer")) {
        el.style.display = "none";
      }
    });
  }

  // ── AUTH GUARD ──
  const page = window.location.pathname.split("/").pop();
  const auth = localStorage.getItem("auth");
  if (!auth && page !== "login.html" && page !== "register.html") {
    location.href = "login.html";
  }

  // ── HELPERS ──
  function roleLabel(r) {
    return { admin: "Admin", transporter: "Transporter", driver: "Driver", farmer: "Farmer" }[r] || r;
  }

  function roleColor(r) {
    return { admin: "#e84545", transporter: "#3ddc6e", driver: "#5bc8f5", farmer: "#f5c842" }[r] || "#3ddc6e";
  }

  window.userRole = role;
})();