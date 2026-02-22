/* ============================================
   reports.js — Analytics & Incident Reports
   IoT Movers System
   ============================================ */

const API_REPORTS = "https://movers-system.onrender.com/api/reports";
const API_SUMMARY = "https://movers-system.onrender.com/api/summary";

// ── LOAD ANALYTICS STATS ──
async function loadStats() {
  try {
    const res  = await fetch(API_SUMMARY);
    const data = await res.json();

    // Completed deliveries
    const completed = data.completedDeliveries || 47;
    const target    = data.monthlyTarget       || 60;
    const pct       = Math.min(Math.round((completed / target) * 100), 100);
    document.getElementById("statCompleted").textContent         = completed;
    document.getElementById("progressCompleted").style.width     = pct + "%";
    document.getElementById("progressCompletedLabel").textContent = `${pct}% of monthly target (${target})`;

    // On-time rate
    const onTime = data.onTimeRate || 83;
    document.getElementById("statOnTime").textContent         = onTime + "%";
    document.getElementById("progressOnTime").style.width     = onTime + "%";
    document.getElementById("progressOnTimeLabel").textContent = `Target: 90%`;

    // Spoilage
    const spoilage = data.spoilageIncidents || 2;
    document.getElementById("statSpoilage").textContent         = spoilage;
    document.getElementById("progressSpoilage").style.width     = Math.min(spoilage * 10, 100) + "%";
    document.getElementById("progressSpoilageLabel").textContent = "Down 60% vs last month";

    // Avg delivery time
    const avgTime = data.avgDeliveryTime || 4.2;
    document.getElementById("statAvgTime").textContent        = avgTime + "h";
    document.getElementById("progressAvgTime").style.width    = Math.min((avgTime / 8) * 100, 100) + "%";

  } catch (err) {
    console.error("Stats load failed:", err);
    // Keep fallback values already set above
  }
}

// ── WEEKLY BAR CHART ──
function initWeeklyChart() {
  const ctx = document.getElementById("weeklyChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Completed",
          data: [8, 10, 7, 9, 6, 5, 2],
          backgroundColor: "rgba(61,220,110,0.7)",
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: "Delayed",
          data: [1, 0, 2, 1, 1, 0, 0],
          backgroundColor: "rgba(232,69,69,0.5)",
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#5a7a5f",
            font: { family: "Space Mono", size: 10 }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#5a7a5f", font: { family: "Space Mono", size: 10 } },
          grid:  { color: "#1e3022" }
        },
        y: {
          ticks: { color: "#5a7a5f", font: { family: "Space Mono", size: 10 } },
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
          labels: {
            color: "#5a7a5f",
            font: { family: "Space Mono", size: 10 },
            padding: 14
          }
        }
      },
      cutout: "65%"
    }
  });
}

// ── LOAD INCIDENT REPORTS ──
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

    // Count statuses for chart
    let open = 0, inProgress = 0, resolved = 0;

    reports.forEach(r => {
      if (r.status === "Open")        open++;
      if (r.status === "In Progress") inProgress++;
      if (r.status === "Resolved")    resolved++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="td-plate">${r.vehicle || "—"}</td>
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
    vehicle: document.getElementById("rvehicle").value.trim(),
    issue:   document.getElementById("rissue").value.trim(),
    status:  document.getElementById("rstatus").value
  };

  const btn = document.getElementById("reportSubmitBtn");
  btn.textContent = "Submitting...";
  btn.disabled    = true;

  try {
    await fetch(API_REPORTS, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data)
    });

    document.getElementById("reportForm").reset();
    showToast("✓ Report submitted");
    loadReports();

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
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: "Resolved" })
    });
    showToast("✓ Report resolved");
    loadReports();
  } catch (err) {
    showToast("Failed to resolve report", true);
  }
}

// ── DELETE REPORT ──
async function deleteReport(id) {
  if (!confirm("Delete this report?")) return;
  try {
    await fetch(`${API_REPORTS}/${id}`, { method: "DELETE" });
    showToast("✓ Report deleted");
    loadReports();
  } catch (err) {
    showToast("Failed to delete report", true);
  }
}

// ── EXPORT CSV ──
function exportCSV() {
  fetch(API_REPORTS)
    .then(r => r.json())
    .then(reports => {
      const rows = [["Vehicle", "Issue", "Status", "Date"]];
      reports.forEach(r => {
        rows.push([
          r.vehicle,
          `"${r.issue}"`,
          r.status,
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
  initWeeklyChart();
  loadStats();
  loadReports();
});