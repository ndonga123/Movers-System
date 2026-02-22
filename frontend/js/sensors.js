/* ============================================
   sensors.js — Live Sensor Data
   IoT Movers System
   ============================================ */

const API     = "https://movers-system.onrender.com/api/summary";
let readingCount = 0;
let alertCount   = 0;
let chart;

// ── LIVE CLOCK ──
function updateClock() {
  const el = document.getElementById("liveTime");
  if (el) el.textContent = new Date().toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// ── INIT CHART ──
function initChart() {
  const ctx = document.getElementById("sensorChart").getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Temp °C",
          data: [],
          borderColor: "#e84545",
          backgroundColor: "rgba(232,69,69,0.08)",
          tension: 0.4,
          fill: true,
          pointRadius: 3
        },
        {
          label: "Humidity %",
          data: [],
          borderColor: "#5bc8f5",
          backgroundColor: "rgba(91,200,245,0.08)",
          tension: 0.4,
          fill: true,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
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
          ticks: { color: "#5a7a5f", font: { family: "Space Mono", size: 9 } },
          grid:  { color: "#1e3022" }
        },
        y: {
          ticks: { color: "#5a7a5f", font: { family: "Space Mono", size: 9 } },
          grid:  { color: "#1e3022" }
        }
      }
    }
  });
}

// ── UPDATE CHART ──
function updateChart(temp, humid) {
  const now = new Date().toLocaleTimeString();

  chart.data.labels.push(now);
  chart.data.datasets[0].data.push(Number(temp));
  chart.data.datasets[1].data.push(Number(humid));

  // Keep last 12 readings on chart
  if (chart.data.labels.length > 12) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
  }

  chart.update();
}

// ── PUSH ALERT ──
function pushAlert(msg, type = "warn") {
  alertCount++;
  document.getElementById("alertCount").textContent = alertCount + " ALERTS";

  const log   = document.getElementById("alertLog");
  const empty = log.querySelector(".alert-log-empty");
  if (empty) empty.remove();

  const item = document.createElement("div");
  item.className = `alert-log-item ${type}`;
  item.innerHTML = `
    <span class="alert-log-dot"></span>
    <div>
      <div class="alert-log-msg">${msg}</div>
      <div class="alert-log-time">${new Date().toLocaleTimeString()}</div>
    </div>`;
  log.prepend(item);
}

// ── ADD TABLE ROW ──
function addTableRow(data) {
  readingCount++;
  document.getElementById("gaugeCount").textContent      = readingCount;
  document.getElementById("readingCountTag").textContent = readingCount + " READINGS";

  const table  = document.getElementById("sensorTable");
  const isHot  = Number(data.temp)     > 30;
  const isHumid = Number(data.humidity) > 80;
  const hasIssue = isHot || isHumid;

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td class="td-plate">Main</td>
    <td style="color:${isHot ? 'var(--accent3)' : 'var(--text)'}">${data.temp} °C ${isHot ? "⚠️" : ""}</td>
    <td style="color:${isHumid ? '#5bc8f5' : 'var(--text)'}">${data.humidity} % ${isHumid ? "⚠️" : ""}</td>
    <td class="td-coords">${data.gps || "—"}</td>
    <td class="td-date">${new Date().toLocaleTimeString()}</td>
    <td>
      <span class="status-badge ${hasIssue ? 'status-delayed' : 'status-transit'}">
        ${hasIssue ? "ALERT" : "NORMAL"}
      </span>
    </td>`;

  // Prepend so newest is at top
  table.prepend(tr);

  // Keep max 50 rows
  const rows = table.querySelectorAll("tr");
  if (rows.length > 50) rows[rows.length - 1].remove();
}

// ── UPDATE GAUGES ──
function updateGauges(data) {
  const tempEl  = document.getElementById("gaugeTemp");
  const humidEl = document.getElementById("gaugeHumid");
  const gpsEl   = document.getElementById("gaugeGPS");

  if (tempEl)  tempEl.textContent  = data.temp + "°C";
  if (humidEl) humidEl.textContent = data.humidity + "%";
  if (gpsEl)   gpsEl.textContent   = data.gps || "--";

  // Color temp based on threshold
  if (tempEl) {
    tempEl.style.color = Number(data.temp) > 30
      ? "var(--accent3)"
      : "var(--accent3)";
  }
}

// ── CLEAR TABLE ──
function clearTable() {
  document.getElementById("sensorTable").innerHTML = "";
  readingCount = 0;
  document.getElementById("gaugeCount").textContent      = 0;
  document.getElementById("readingCountTag").textContent = "0 READINGS";
}

// ── FETCH & POLL ──
async function fetchSensorData() {
  try {
    const res  = await fetch(API);
    const data = await res.json();

    updateGauges(data);
    updateChart(data.temp, data.humidity);
    addTableRow(data);

    // Threshold alerts
    if (Number(data.temp) > 30) {
      pushAlert(`🌡 High temperature: ${data.temp}°C — cargo risk!`, "danger");
    }
    if (Number(data.humidity) > 80) {
      pushAlert(`💧 High humidity: ${data.humidity}% — spoilage risk!`, "warn");
    }

  } catch (err) {
    console.error("Sensor fetch failed:", err);
  }
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
    if (label)  label.textContent = "Transporter";
  }
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  fetchSensorData();
  setInterval(fetchSensorData, 5000);
});