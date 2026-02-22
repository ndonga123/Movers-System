/* ============================================
   drivers.js — Fleet Drivers Logic
   IoT Movers System
   ============================================ */

const API = "https://movers-system.onrender.com/api/drivers";
let editingId = null;

// ── LOAD DRIVERS ──
async function loadDrivers() {
  try {
    const res     = await fetch(API);
    const drivers = await res.json();

    const tbody  = document.getElementById("driverList");
    const empty  = document.getElementById("emptyState");
    const table  = document.getElementById("driverTable");
    const tag    = document.getElementById("driverCountTag");

    // Stats
    const assigned   = drivers.filter(d => d.vehicleID).length;
    const unassigned = drivers.length - assigned;

    const statTotal      = document.getElementById("statTotal");
    const statAssigned   = document.getElementById("statAssigned");
    const statUnassigned = document.getElementById("statUnassigned");

    if (statTotal)      statTotal.textContent      = drivers.length;
    if (statAssigned)   statAssigned.textContent   = assigned;
    if (statUnassigned) statUnassigned.textContent = unassigned;
    if (tag)            tag.textContent            = drivers.length + " DRIVERS";

    if (!tbody) return;

    if (drivers.length === 0) {
      if (table) table.style.display = "none";
      if (empty) empty.style.display = "block";
      return;
    }

    if (table) table.style.display = "table";
    if (empty) empty.style.display = "none";

    tbody.innerHTML = "";

    drivers.forEach(d => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="td-plate">👤 ${d.name || "—"}</td>
        <td class="td-route">${d.phoneNumber || "—"}</td>
        <td>
          ${d.vehicleID
            ? `<span class="status-badge status-transit">${d.vehicleID}</span>`
            : `<span class="status-badge status-pending">Unassigned</span>`
          }
        </td>
        <td>
          <div class="td-actions">
            <button class="btn-edit"
              onclick="openEditModal('${d._id}','${d.name}','${d.phoneNumber}','${d.vehicleID||""}')">
              ✏ Edit
            </button>
            <button class="btn-delete"
              onclick="deleteDriver('${d._id}','${d.name}')">
              🗑 Delete
            </button>
          </div>
        </td>`;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Load drivers failed:", err);
    showToast("Failed to load drivers", true);
  }
}

// ── OPEN ADD MODAL ──
function openModal() {
  editingId = null;
  document.getElementById("driverForm").reset();
  document.getElementById("editId").value           = "";
  document.getElementById("modalTitle").textContent = "Add Driver";
  document.getElementById("modalSub").textContent   = "Register a new driver to the fleet";
  document.getElementById("submitBtn").textContent  = "Add Driver";
  document.getElementById("modalOverlay").classList.add("open");
}

// ── OPEN EDIT MODAL ──
function openEditModal(id, name, phone, vehicle) {
  editingId = id;
  document.getElementById("editId").value    = id;
  document.getElementById("dname").value     = name;
  document.getElementById("dphone").value    = phone;
  document.getElementById("dvehicle").value  = vehicle;
  document.getElementById("modalTitle").textContent = "Edit Driver";
  document.getElementById("modalSub").textContent   = "Update driver details";
  document.getElementById("submitBtn").textContent  = "Save Changes";
  document.getElementById("modalOverlay").classList.add("open");
}

// ── CLOSE MODAL ──
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  editingId = null;
}

// Close on overlay click
document.getElementById("modalOverlay").addEventListener("click", function(e) {
  if (e.target === this) closeModal();
});

// ── HANDLE SUBMIT (ADD or EDIT) ──
async function handleSubmit(e) {
  e.preventDefault();

  const data = {
    name:        document.getElementById("dname").value.trim(),
    phoneNumber: document.getElementById("dphone").value.trim(),
    vehicleID:   document.getElementById("dvehicle").value.trim()
  };

  const btn = document.getElementById("submitBtn");
  btn.textContent = "Saving...";
  btn.disabled    = true;

  try {
    if (editingId) {
      await fetch(`${API}/${editingId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data)
      });
      showToast("✓ Driver updated");
    } else {
      await fetch(API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data)
      });
      showToast("✓ Driver added");
    }

    closeModal();
    loadDrivers();

  } catch (err) {
    console.error("Save failed:", err);
    showToast("Error saving driver", true);
  } finally {
    btn.disabled    = false;
    btn.textContent = editingId ? "Save Changes" : "Add Driver";
  }
}

// ── DELETE DRIVER ──
async function deleteDriver(id, name) {
  if (!confirm(`Delete driver "${name}"? This cannot be undone.`)) return;
  try {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    showToast("✓ Driver deleted");
    loadDrivers();
  } catch (err) {
    showToast("Error deleting driver", true);
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
  loadDrivers();
});