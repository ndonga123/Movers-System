/* ============================================
   role-guard.js — Role-based UI restrictions
   IoT Movers System
   
   Include this script on every page AFTER the
   page content loads. It reads the role from
   localStorage and shows/hides elements.
   ============================================ */

(function() {
  const role     = localStorage.getItem("role")     || "farmer";
  const userName = localStorage.getItem("userName") || "User";
  const email    = localStorage.getItem("email")    || "";

  // ── UPDATE SIDEBAR USER INFO ──
  const userNameEl   = document.getElementById("userName");
  const userRoleLabel = document.getElementById("userRoleLabel");
  const userAvatar   = document.getElementById("userAvatar");

  if (userNameEl)    userNameEl.textContent    = userName;
  if (userRoleLabel) userRoleLabel.textContent = roleLabel(role);
  if (userAvatar) {
    userAvatar.textContent   = userName.charAt(0).toUpperCase();
    userAvatar.style.background = roleColor(role);
    userAvatar.style.color      = "#111";
  }

  // ── HIDE ELEMENTS BY ROLE ──
  // data-role="admin,transporter"  → visible only to admin and transporter
  // data-role="driver"             → visible only to driver
  document.querySelectorAll("[data-role]").forEach(el => {
    const allowed = el.getAttribute("data-role").split(",").map(r => r.trim());
    if (!allowed.includes(role)) {
      el.style.display = "none";
    }
  });

  // ── HIDE ENTIRE NAV ITEMS BY ROLE ──
  if (role === "farmer") {
    // Farmers don't see vehicles, drivers, sensors management
    hideNavItem("vehicles.html");
    hideNavItem("drivers.html");
    hideNavItem("sensors.html");
  }

  if (role === "driver") {
    // Drivers don't see drivers management page
    hideNavItem("drivers.html");
  }

  // ── REDIRECT IF ACCESSING RESTRICTED PAGE ──
  const page = window.location.pathname.split("/").pop();

  const restrictions = {
    "vehicles.html": ["admin", "transporter"],
    "drivers.html":  ["admin", "transporter"],
  };

  if (restrictions[page] && !restrictions[page].includes(role)) {
    // Show message then redirect
    document.body.innerHTML = `
      <div style="
        display:flex; flex-direction:column; align-items:center;
        justify-content:center; min-height:100vh;
        background:#0a1a0d; color:#3ddc6e; font-family:'Syne',sans-serif;
        text-align:center; gap:16px;">
        <div style="font-size:48px">🚫</div>
        <h2 style="font-size:24px; font-weight:800;">Access Restricted</h2>
        <p style="color:#5a7a5f; font-family:'Space Mono',monospace; font-size:13px;">
          Your role (${roleLabel(role)}) does not have permission to view this page.
        </p>
        <a href="dashboard.html" style="
          margin-top:12px; padding:12px 28px;
          background:#3ddc6e; color:#0a1a0d;
          border-radius:10px; font-weight:800;
          text-decoration:none; font-size:14px;">
          ← Back to Dashboard
        </a>
      </div>`;
    return;
  }

  // ── AUTH GUARD — redirect to login if not authenticated ──
  const auth = localStorage.getItem("auth");
  if (!auth && page !== "login.html" && page !== "register.html") {
    location.href = "login.html";
  }

  // ── HELPERS ──
  function hideNavItem(href) {
    document.querySelectorAll(`.nav-item[href="${href}"]`).forEach(el => {
      el.style.display = "none";
    });
  }

  function roleLabel(r) {
    const labels = {
      admin:       "Admin",
      transporter: "Transporter",
      driver:      "Driver",
      farmer:      "Farmer"
    };
    return labels[r] || r;
  }

  function roleColor(r) {
    const colors = {
      admin:       "#e84545",
      transporter: "#3ddc6e",
      driver:      "#5bc8f5",
      farmer:      "#f5c842"
    };
    return colors[r] || "#3ddc6e";
  }

  // Expose role globally so other scripts can use it
  window.userRole = role;
})();