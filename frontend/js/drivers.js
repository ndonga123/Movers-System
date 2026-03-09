/* drivers.js — Fleet Drivers Logic — IoT Movers System */

const API = "https://movers-system.onrender.com/api/drivers";
let editingId = null;

function authHeaders() {
  return { "Content-Type": "application/json", "x-auth-token": localStorage.getItem("token") || "" };
}

async function loadDrivers() {
  try {
    const res     = await fetch(API);
    const drivers = await res.json();
    const tbody   = document.getElementById("driverList");
    const empty   = document.getElementById("emptyState");
    const table   = document.getElementById("driverTable");
    const tag     = document.getElementById("driverCountTag");

    const assigned   = drivers.filter(d => d.vehicleID).length;
    const unassigned = drivers.length - assigned;

    if (document.getElementById("statTotal"))      document.getElementById("statTotal").textContent      = drivers.length;
    if (document.getElementById("statAssigned"))   document.getElementById("statAssigned").textContent   = assigned;
    if (document.getElementById("statUnassigned")) document.getElementById("statUnassigned").textContent = unassigned;
    if (tag) tag.textContent = drivers.length + " DRIVERS";

    if (!tbody) return;

    if (drivers.length === 0) {
      if (table) table.style.display = "none";
      if (empty) empty.style.display = "block";
      return;
    }

    if (table) table.style.display = "table";
    if (empty) empty.style.display = "none";
    tbody.innerHTML = "";

    const role      = localStorage.getItem("role") || "farmer";
    const canManage = ["admin", "transporter"].includes(role);

    drivers.forEach(d => {
      const tr = document.createElement("tr");
      const actions = canManage
        ? '<div class="td-actions">' +
          '<button class="btn-edit" onclick="openEditModal(\'' + d._id + '\',\'' + (d.name||"").replace(/'/g,"\\'") + '\',\'' + (d.phoneNumber||"") + '\',\'' + (d.vehicleID||"") + '\')">✏ Edit</button>' +
          '<button class="btn-delete" onclick="deleteDriver(\'' + d._id + '\',\'' + (d.name||"").replace(/'/g,"\\'") + '\')">🗑 Delete</button></div>'
        : '<span class="status-badge status-pending">View Only</span>';

      tr.innerHTML =
        '<td class="td-plate">👤 ' + (d.name || "—") + "</td>" +
        '<td class="td-route">' + (d.phoneNumber || "—") + "</td>" +
        "<td>" + (d.vehicleID
          ? '<span class="status-badge status-transit">' + d.vehicleID + "</span>"
          : '<span class="status-badge status-pending">Unassigned</span>') + "</td>" +
        "<td>" + actions + "</td>";
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Load drivers failed:", err);
    showToast("Failed to load drivers", true);
  }
}

function openModal() {
  editingId = null;
  document.getElementById("driverForm").reset();
  document.getElementById("editId").value           = "";
  document.getElementById("modalTitle").textContent = "Add Driver";
  document.getElementById("modalSub").textContent   = "Register a new driver to the fleet";
  document.getElementById("submitBtn").textContent  = "Add Driver";
  document.getElementById("modalOverlay").classList.add("open");
}

function openEditModal(id, name, phone, vehicle) {
  editingId = id;
  document.getElementById("editId").value           = id;
  document.getElementById("dname").value            = name;
  document.getElementById("dphone").value           = phone;
  document.getElementById("dvehicle").value         = vehicle;
  document.getElementById("modalTitle").textContent = "Edit Driver";
  document.getElementById("modalSub").textContent   = "Update driver details";
  document.getElementById("submitBtn").textContent  = "Save Changes";
  document.getElementById("modalOverlay").classList.add("open");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  editingId = null;
}

document.getElementById("modalOverlay").addEventListener("click", function(e) {
  if (e.target === this) closeModal();
});

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
    let res;
    if (editingId) {
      res = await fetch(API + "/" + editingId, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) });
    } else {
      res = await fetch(API, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) });
    }

    if (res.status === 401) { showToast("Session expired — please log in again", true); return; }
    if (res.status === 403) { showToast("You do not have permission to do this", true); return; }
    if (!res.ok)            { showToast("Error saving driver", true); return; }

    showToast(editingId ? "✓ Driver updated" : "✓ Driver added");
    closeModal();
    await loadDrivers();

  } catch (err) {
    showToast("Network error — please try again", true);
  } finally {
    btn.disabled    = false;
    btn.textContent = editingId ? "Save Changes" : "Add Driver";
  }
}

async function deleteDriver(id, name) {
  if (!confirm('Delete driver "' + name + '"? This cannot be undone.')) return;
  try {
    const res = await fetch(API + "/" + id, { method: "DELETE", headers: authHeaders() });
    if (res.status === 401) { showToast("Session expired — please log in again", true); return; }
    if (res.status === 403) { showToast("Only admins can delete drivers", true); return; }
    if (!res.ok)            { showToast("Error deleting driver", true); return; }
    showToast("✓ Driver deleted");
    await loadDrivers();
  } catch (err) {
    showToast("Network error", true);
  }
}

function showToast(msg, isError) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent   = msg;
  t.className     = "toast" + (isError ? " error" : "");
  t.style.display = "block";
  setTimeout(() => { t.style.display = "none"; }, 3500);
}

function toggleDark() { document.body.classList.toggle("dark"); }

document.addEventListener("DOMContentLoaded", () => { loadDrivers(); });