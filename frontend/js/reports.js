/* ============================================
   reports.js — Analytics & Incident Reports
   IoT Movers System
   ============================================ */

const API_REPORTS   = "https://movers-system.onrender.com/api/reports";
const API_DELIVERIES = "https://movers-system.onrender.com/api/deliveries";
const API_VEHICLES  = "https://movers-system.onrender.com/api/vehicles";
const API_DRIVERS   = "https://movers-system.onrender.com/api/drivers";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "x-auth-token": localStorage.getItem("token") || ""
  };
}

// ── LOAD STATS FROM REAL DELIVERIES DATA ──
async function loadStats() {
  try {
    const res        = await fetch(API_DELIVERIES);
    const deliveries = await res.json();

    const total     = deliveries.length;
    const inTransit = deliveries.filter(d => d.status === "In Transit").length;
    const delivered = deliveries.filter(d => d.status === "Delivered").length;
    const pending   = deliveries.filter(d => d.status === "Pending").length;

    // Total deliveries
    document.getElementById("statCompleted").textContent          = total;
    document.getElementById("progressCompleted").style.width      = "100%";
    document.getElementById("progressCompletedLabel").textContent = `${delivered} delivered · ${pending} pending`;

    // In transit
    const transitPct = total > 0 ? Math.round((inTransit / total) * 100) : 0;
    document.getElementById("statOnTime").textContent          = inTransit;
    document.getElementById("progressOnTime").style.width      = transitPct + "%";
    document.getElementById("progressOnTimeLabel").textContent = `${transitPct}% of total deliveries`;

    // Delivered
    const deliveredPct = total > 0 ? Math.round((delivered / total) * 100) : 0;
    document.getElementById("statAvgTime").textContent        = delivered;
    document.getElementById("progressAvgTime").style.width    = deliveredPct + "%";

    // Open incidents — loaded separately from reports
    loadOpenIncidents();

    // Update weekly chart with real data
    updateWeeklyChart(pending, inTransit, delivered);

  } catch (err) {
    console.error("Stats load failed:", err);
  }
}

// ── OPEN INCIDENTS COUNT FROM REPORTS ──
async function loadOpenIncidents() {
  try {
    const res     = await fetch(API_REPORTS);
    const reports = await res.json();
    const open    = reports.filter(r => r.status === "Open").length;
    const total   = reports.length;
    const pct     = total > 0 ? Math.round((open / total) * 100) : 0;

    document.getElementById("statSpoilage").textContent          = open;
    document.getElementById("progressSpoilage").style.width      = pct + "%";
    document.getElementById("progressSpoilageLabel").textContent = `${pct}% of ${total} reports`;
  } catch (err) {
    console.error("Incidents load failed:", err);
  }
}

// ── POPULATE VEHICLE AND DRIVER DROPDOWNS ──
async function loadDropdowns() {
  try {
    const [vRes, dRes] = await Promise.all([
      fetch(API_VEHICLES),
      fetch(API_DRIVERS)
    ]);
    const vehicles = await vRes.json();
    const drivers  = await dRes.json();

    const vSel = document.getElementById("rvehicle");
    const dSel = document.getElementById("rdriver");

    vSel.innerHTML = '<option value="">— Select Vehicle —</option>';
    vehicles.forEach(v => {
      const opt = document.createElement("option");
      opt.value       = v.name;
      opt.textContent = `${v.name} (${v.from || "?"} → ${v.to || "?"})`;
      vSel.appendChild(opt);
    });

    dSel.innerHTML = '<option value="">— Select Driver —</option>';
    drivers.forEach(d => {
      const opt = document.createElement("option");
      opt.value       = d.name;
      opt.textContent = d.vehicleID ? `${d.name} (${d.vehicleID})` : d.name;
      dSel.appendChild(opt);
    });

  } catch (err) {
    console.error("Dropdowns failed:", err);
    showToast("Failed to load vehicles/drivers", true);
  }
}

// ── WEEKLY CHART — from real delivery statuses ──
let weeklyChart;

function updateWeeklyChart(pending, inTransit, delivered) {
  const ctx = document.getElementById("weeklyChart").getContext("2d");
  if (weeklyChart) weeklyChart.destroy();

  weeklyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Pending", "In Transit", "Delivered"],
      datasets: [{
        label: "Deliveries",
        data: [pending, inTransit, delivered],
        backgroundColor: [
          "rgba(245,200,66,0.7)",
          "rgba(91,200,245,0.7)",
          "rgba(61,220,110,0.7)"
        ],
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#5a7a5f", font: { family: "Space Mono", size: 10 } }
        }
      },
      scales: {
        x: {
          ticks: { color: "#5a7a5f", font: { family: "Space Mono", size: 10 } },
          grid:  { color: "#1e3022" }
        },
        y: {
          ticks: { color: "#5a7a5f", font: { family: "Space Mono", size: 10 }, stepSize: 1 },
          grid:  { color: "#1e3022" }
        }
      }
    }
  });
}

// ── INCIDENT PIE CHART ──
let incidentChart;

function updateIncidentChart(open, inProgress, resolved) {
  const ctx = document.getElementById("incidentChart").getContext("2d");
  if (incidentChart) incidentChart.destroy();

  incidentChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Open", "In Progress", "Resolved"],
      datasets: [{
        data: [open, inProgress, resolved],
        backgroundColor: [
          "rgba(232,69,69,0.7)",
          "rgba(245,200,66,0.7)",
          "rgba(61,220,110,0.7)"
        ],
        borderColor: "#111a14",
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#5a7a5f", font: { family: "Space Mono", size: 10 }, padding: 14 }
        }
      },
      cutout: "65%"
    }
  });
}

// ── LOAD REPORTS TABLE ──
async function loadReports() {
  try {
    const res     = await fetch(API_REPORTS);
    const reports = await res.json();

    const tbody    = document.getElementById("reportList");
    const empty    = document.getElementById("emptyReports");
    const countTag = document.getElementById("reportCountTag");

    countTag.textContent = reports.length + " REPORTS";

    if (reports.length === 0) {
      tbody.innerHTML     = "";
      empty.style.display = "block";
      updateIncidentChart(0, 0, 0);
      return;
    }

    empty.style.display = "none";
    tbody.innerHTML     = "";

    let open = 0, inProgress = 0, resolved = 0;

    reports.forEach(r => {
      if (r.status === "Open")        open++;
      if (r.status === "In Progress") inProgress++;
      if (r.status === "Resolved")    resolved++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="td-plate">${r.vehicle || "—"}</td>
        <td>${r.driver  || "—"}</td>
        <td class="td-issue">${r.issue   || "—"}</td>
        <td><span class="status-badge ${statusClass(r.status)}">${r.status}</span></td>
        <td class="td-date">${r.date ? new Date(r.date).toLocaleDateString() : "—"}</td>
        <td>
          <div class="td-actions">
            ${r.status !== "Resolved"
              ? `<button class="btn-resolve" onclick="resolveReport('${r._id}')">✓ Resolve</button>`
              : `<span class="resolved-label">✓ Done</span>`
            }
            <button class="btn-delete" onclick="deleteReport('${r._id}')">🗑</button>
          </div>
        </td>`;
      tbody.appendChild(tr);
    });

    document.getElementById("incidentCountTag").textContent = reports.length + " TOTAL";
    updateIncidentChart(open, inProgress, resolved);

  } catch (err) {
    console.error("Reports load failed:", err);
    showToast("Failed to load reports", true);
  }
}

function statusClass(status) {
  if (status === "Open")        return "status-delayed";
  if (status === "In Progress") return "status-pending";
  if (status === "Resolved")    return "status-transit";
  return "";
}

// ── SUBMIT REPORT ──
async function submitReport(e) {
  e.preventDefault();

  const data = {
    vehicle: document.getElementById("rvehicle").value,
    driver:  document.getElementById("rdriver").value,
    issue:   document.getElementById("rissue").value.trim(),
    status:  document.getElementById("rstatus").value,
    date:    new Date()
  };

  const btn = document.getElementById("reportSubmitBtn");
  btn.textContent = "Submitting...";
  btn.disabled    = true;

  try {
    await fetch(API_REPORTS, {
      method:  "POST",
      headers: authHeaders(),
      body:    JSON.stringify(data)
    });
    document.getElementById("reportForm").reset();
    showToast("✓ Report submitted");
    loadReports();
    loadStats();
  } catch (err) {
    showToast("Failed to submit report", true);
  } finally {
    btn.disabled    = false;
    btn.textContent = "Submit Report";
  }
}

// ── RESOLVE REPORT ──
async function resolveReport(id) {
  try {
    await fetch(`${API_REPORTS}/${id}`, {
      method:  "PUT",
      headers: authHeaders(),
      body:    JSON.stringify({ status: "Resolved" })
    });
    showToast("✓ Report resolved");
    loadReports();
    loadStats();
  } catch (err) {
    showToast("Failed to resolve report", true);
  }
}

// ── DELETE REPORT ──
async function deleteReport(id) {
  if (!confirm("Delete this report?")) return;
  try {
    await fetch(`${API_REPORTS}/${id}`, { method: "DELETE", headers: authHeaders() });
    showToast("✓ Report deleted");
    loadReports();
    loadStats();
  } catch (err) {
    showToast("Failed to delete report", true);
  }
}

// ── EXPORT CSV ──
function exportCSV() {
  fetch(API_REPORTS)
    .then(r => r.json())
    .then(reports => {
      const rows = [["Vehicle", "Driver", "Issue", "Status", "Date"]];
      reports.forEach(r => {
        rows.push([
          r.vehicle || "",
          r.driver  || "",
          `"${r.issue || ""}"`,
          r.status  || "",
          r.date ? new Date(r.date).toLocaleDateString() : ""
        ]);
      });
      const csv  = rows.map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "iot-movers-reports.csv";
      a.click();
      URL.revokeObjectURL(url);
      showToast("✓ CSV exported");
    })
    .catch(() => showToast("Export failed", true));
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

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  loadDropdowns();
  loadStats();
  loadReports();
});