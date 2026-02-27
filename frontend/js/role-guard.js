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

  // ── HIDE ELEMENTS BY ROLE ──
  // data-role="admin,transporter" → only those roles see the element
  // Used on: Add buttons, Actions column headers, Edit/Delete buttons
  document.querySelectorAll("[data-role]").forEach(el => {
    const allowed = el.getAttribute("data-role").split(",").map(r => r.trim());
    if (!allowed.includes(role)) {
      el.style.display = "none";
    }
  });

  // ── ALL ROLES CAN VIEW ALL PAGES ──
  // No nav items hidden — everyone sees the full sidebar
  // Restrictions are only on ADD/EDIT/DELETE buttons via data-role

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