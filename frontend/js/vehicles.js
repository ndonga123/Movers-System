/* ============================================
   vehicles.js — Fleet Vehicles Logic
   IoT Movers System
   ============================================ */

const API = "https://movers-system.onrender.com/api/vehicles";
let watchId = null;

// ── LOAD VEHICLES INTO TABLE ──
async function loadVehicles() {
  try {
    const res      = await fetch(API);
    const vehicles = await res.json();

    const tbody = document.getElementById("vehicleList");
    const empty = document.getElementById("emptyState");
    const table = document.getElementById("vehicleTable");

    const statTotal  = document.getElementById("statTotal");
    const statRoutes = document.getElementById("statRoutes");
    const countTag   = document.getElementById("vehicleCountTag");

    if (statTotal)  statTotal.textContent  = vehicles.length;
    if (statRoutes) statRoutes.textContent = vehicles.filter(v => v.from && v.to).length;
    if (countTag)   countTag.textContent   = vehicles.length + " VEHICLES";

    if (!tbody) return;

    if (vehicles.length === 0) {
      if (table) table.style.display = "none";
      if (empty) empty.style.display = "block";
      return;
    }

    if (table) table.style.display = "table";
    if (empty) empty.style.display = "none";
    tbody.innerHTML = "";

    vehicles.forEach(v => {
      const hasRoute = v.route && v.route.length > 1;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="td-plate">🚛 ${v.name || "—"}</td>
        <td class="td-route">${v.from || "—"} → ${v.to || "—"}</td>
        <td>
          <span class="status-badge ${hasRoute ? "status-transit" : "status-pending"}">
            ${hasRoute ? "ROUTE SET" : "NO ROUTE"}
          </span>
        </td>
        <td>
          <div class="td-actions">
            <button class="btn-edit"
              onclick="openEditModal('${v._id}','${v.name}','${v.from||""}','${v.to||""}')">
              ✏ Edit
            </button>
            <button class="btn-delete"
              onclick="deleteVehicle('${v._id}','${v.name}')">
              🗑 Delete
            </button>
          </div>
        </td>`;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Load vehicles failed:", err);
    showToast("Failed to load vehicles", true);
  }
}

// ── OPEN ADD MODAL ──
function openModal() {
  window._editingId = null;
  document.getElementById("vehicleForm").reset();
  document.getElementById("editId").value           = "";
  document.getElementById("modalTitle").textContent = "Add Vehicle";
  document.getElementById("modalSub").textContent   = "Enter vehicle name and city names — route generated automatically";
  document.getElementById("submitBtn").textContent  = "Add Vehicle";
  hideRouteStatus();
  document.getElementById("modalOverlay").classList.add("open");
}

// ── OPEN EDIT MODAL — city names only, no coords ──
function openEditModal(id, name, from, to) {
  window._editingId = id;
  document.getElementById("editId").value           = id;
  document.getElementById("name").value             = name;
  document.getElementById("from").value             = from;
  document.getElementById("to").value               = to;
  document.getElementById("modalTitle").textContent = "Edit Vehicle";
  document.getElementById("modalSub").textContent   = "Update vehicle details";
  document.getElementById("submitBtn").textContent  = "Save Changes";
  hideRouteStatus();
  document.getElementById("modalOverlay").classList.add("open");
}

// ── CLOSE MODAL ──
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  window._editingId = null;
}

// ── ROUTE STATUS ──
function showRouteStatus(msg) {
  const el    = document.getElementById("routeStatus");
  const msgEl = document.getElementById("routeStatusMsg");
  if (el)    el.style.display  = "flex";
  if (msgEl) msgEl.textContent = msg;
}

function hideRouteStatus() {
  const el = document.getElementById("routeStatus");
  if (el) el.style.display = "none";
}

// ── HANDLE FORM SUBMIT ──
// Only sends name, from, to — backend geocodes cities + generates ORS route
async function handleSubmit(e) {
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value.trim(),
    from: document.getElementById("from").value.trim(),
    to:   document.getElementById("to").value.trim()
  };

  const btn = document.getElementById("submitBtn");
  btn.disabled = true;

  try {
    if (window._editingId) {
      btn.textContent = "Saving...";
      await fetch(`${API}/${window._editingId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data)
      });
      showToast("✓ Vehicle updated");
    } else {
      btn.textContent = "Generating route...";
      showRouteStatus("Geocoding cities and generating road route...");
      await fetch(API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data)
      });
      showToast("✓ Vehicle added with route");
    }

    closeModal();
    loadVehicles();

  } catch (err) {
    console.error("Save failed:", err);
    showToast("Error saving vehicle — check city names", true);
    hideRouteStatus();
  } finally {
    btn.disabled    = false;
    btn.textContent = window._editingId ? "Save Changes" : "Add Vehicle";
  }
}

// ── DELETE VEHICLE ──
async function deleteVehicle(id, name) {
  if (!confirm(`Delete vehicle "${name}"? This cannot be undone.`)) return;
  try {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    showToast("✓ Vehicle deleted");
    loadVehicles();
  } catch (err) {
    showToast("Error deleting vehicle", true);
  }
}

// ── LIVE GPS — updates vehicle position from device GPS ──
function startLiveGPS(vehicleId) {
  if (!navigator.geolocation) {
    showToast("GPS not supported on this device", true);
    return;
  }

  if (watchId) navigator.geolocation.clearWatch(watchId);
  showToast("📍 Live GPS started");

  watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        await fetch(`${API}/${vehicleId}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ latitude, longitude })
        });
        const gpsEl = document.getElementById("gps");
        if (gpsEl) gpsEl.textContent = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      } catch (err) {
        console.error("GPS update failed:", err);
      }
    },
    (err) => {
      showToast("GPS error: " + err.message, true);
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );
}

function stopLiveGPS() {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    showToast("GPS tracking stopped");
  }
}

// ── TOAST ──
function showToast(msg, isError = false) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent   = msg;
  t.className     = "toast" + (isError ? " error" : "");
  t.style.display = "block";
  setTimeout(() => { t.style.display = "none"; }, 3000);
}

// ── DARK MODE ──
function toggleDark() {
  document.body.classList.toggle("dark");
}

// ── ROLE SWITCHER ──
function switchRole(role, btn) {
  document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const avatar = document.getElementById("userAvatar");
  const label  = document.getElementById("userRoleLabel");
  if (role === "farmer") {
    if (avatar) { avatar.textContent = "F"; avatar.style.background = "#f5c842"; avatar.style.color = "#111"; }
    if (label)  label.textContent = "Farmer";
  } else {
    if (avatar) { avatar.textContent = "T"; avatar.style.background = "#3ddc6e"; avatar.style.color = "#111"; }
    if (label)  label.textContent = "Admin · Transporter";
  }
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  loadVehicles();
});