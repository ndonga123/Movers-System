/* ============================================
   sensors.js — Live Sensor Data
   IoT Movers System
   ============================================ */

const API_SUMMARY = "https://movers-system.onrender.com/api/summary";
const API_SENSORS = "https://movers-system.onrender.com/api/sensors";
const API_VEHICLES= "https://movers-system.onrender.com/api/vehicles";

let readingCount = 0;
let alertCount   = 0;
let chart;

// ── DATA FILTER (Exponential Moving Average) ──
// Smooths out sudden spikes from noisy sensors
// Alpha: 0.3 = more smoothing, 0.7 = more responsive
const ALPHA = 0.3;
let filteredTemp  = null;
let filteredHumid = null;

function applyFilter(newTemp, newHumid) {
  if (filteredTemp === null) {
    filteredTemp  = Number(newTemp);
    filteredHumid = Number(newHumid);
  } else {
    filteredTemp  = ALPHA * Number(newTemp)  + (1 - ALPHA) * filteredTemp;
    filteredHumid = ALPHA * Number(newHumid) + (1 - ALPHA) * filteredHumid;
  }
  return {
    temp:  filteredTemp.toFixed(1),
    humid: filteredHumid.toFixed(1)
  };
}

// ── LIVE CLOCK ──
function updateClock() {
  const el = document.getElementById("liveTime");
  if (el) el.textContent = new Date().toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// ── LOAD VEHICLES FOR DROPDOWN ──
async function loadVehicleFilter() {
  try {
    const res      = await fetch(API_VEHICLES);
    const vehicles = await res.json();
    const sel      = document.getElementById("vehicleFilter");
    if (!sel) return;
    vehicles.forEach(v => {
      const opt = document.createElement("option");
      opt.value       = v._id;
      opt.textContent = v.name;
      sel.appendChild(opt);
    });
  } catch (err) { console.warn("Vehicle filter load failed:", err); }
}

// ── INIT CHART ──
function initChart() {
  const ctx = document.getElementById("sensorChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Raw Temp °C",
          data: [],
          borderColor: "rgba(232,69,69,0.3)",
          borderDash: [4,4],
          tension: 0.4,
          fill: false,
          pointRadius: 2
        },
        {
          label: "Filtered Temp °C",
          data: [],
          borderColor: "#e84545",
          backgroundColor: "rgba(232,69,69,0.08)",
          tension: 0.4,
          fill: true,
          pointRadius: 3
        },
        {
          label: "Filtered Humidity %",
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
        legend: { labels: { color: "#5a7a5f", font: { family: "Space Mono", size: 10 } } },
        tooltip: {
          callbacks: {
            footer: () => "Dashed = raw · Solid = filtered (EMA)"
          }
        }
      },
      scales: {
        x: { ticks: { color: "#5a7a5f", font: { family: "Space Mono", size: 9 } }, grid: { color: "#1e3022" } },
        y: { ticks: { color: "#5a7a5f", font: { family: "Space Mono", size: 9 } }, grid: { color: "#1e3022" } }
      }
    }
  });
}

// ── UPDATE CHART ──
function updateChart(rawTemp, filtTemp, filtHumid) {
  const now = new Date().toLocaleTimeString();
  chart.data.labels.push(now);
  chart.data.datasets[0].data.push(Number(rawTemp));
  chart.data.datasets[1].data.push(Number(filtTemp));
  chart.data.datasets[2].data.push(Number(filtHumid));

  if (chart.data.labels.length > 12) {
    chart.data.labels.shift();
    chart.data.datasets.forEach(d => d.data.shift());
  }
  chart.update();
}

// ── PUSH ALERT ──
function pushAlert(msg, type) {
  alertCount++;
  document.getElementById("alertCount").textContent = alertCount + " ALERTS";
  const log   = document.getElementById("alertLog");
  const empty = log.querySelector(".alert-log-empty");
  if (empty) empty.remove();
  const item = document.createElement("div");
  item.className = "alert-log-item " + type;
  item.innerHTML =
    '<span class="alert-log-dot"></span>' +
    '<div><div class="alert-log-msg">' + msg + '</div>' +
    '<div class="alert-log-time">' + new Date().toLocaleTimeString() + '</div></div>';
  log.prepend(item);
}

// ── ADD TABLE ROW ──
function addTableRow(raw, filtered, vehicleName) {
  readingCount++;
  document.getElementById("gaugeCount").textContent      = readingCount;
  document.getElementById("readingCountTag").textContent = readingCount + " READINGS";

  const table    = document.getElementById("sensorTable");
  const isHot    = Number(filtered.temp)  > 30;
  const isHumid  = Number(filtered.humid) > 80;
  const hasIssue = isHot || isHumid;

  const tr = document.createElement("tr");
  tr.innerHTML =
    '<td class="td-plate">' + (vehicleName || "Fleet Vehicle") + "</td>" +
    "<td>" + raw.temp + " °C</td>" +
    '<td style="color:' + (isHot ? "var(--accent3)" : "var(--text)") + '">' + filtered.temp + " °C " + (isHot ? "⚠️" : "") + "</td>" +
    '<td style="color:' + (isHumid ? "#5bc8f5" : "var(--text)") + '">' + filtered.humid + "% " + (isHumid ? "⚠️" : "") + "</td>" +
    '<td class="td-coords">' + (raw.gps || "—") + "</td>" +
    "<td>" + new Date().toLocaleTimeString() + "</td>" +
    '<td><span class="status-badge ' + (hasIssue ? "status-delayed" : "status-transit") + '">' +
    (hasIssue ? "ALERT" : "NORMAL") + "</span></td>";

  table.prepend(tr);
  const rows = table.querySelectorAll("tr");
  if (rows.length > 50) rows[rows.length - 1].remove();
}

// ── UPDATE GAUGES ──
function updateGauges(filtered, gps) {
  const tempEl  = document.getElementById("gaugeTemp");
  const humidEl = document.getElementById("gaugeHumid");
  const gpsEl   = document.getElementById("gaugeGPS");
  if (tempEl)  { tempEl.textContent  = filtered.temp + "°C"; tempEl.style.color = Number(filtered.temp) > 30 ? "var(--accent3)" : "#3ddc6e"; }
  if (humidEl) { humidEl.textContent = filtered.humid + "%"; humidEl.style.color = Number(filtered.humid) > 80 ? "#5bc8f5" : "var(--text)"; }
  if (gpsEl)   gpsEl.textContent     = gps || "--";
}

// ── LOAD HISTORY FROM DB ──
async function loadHistory() {
  try {
    const res     = await fetch(API_SENSORS);
    const records = await res.json();
    if (!records.length) return;

    const table = document.getElementById("sensorTable");
    table.innerHTML = "";

    records.forEach(r => {
      const isHot   = r.temperature > 30;
      const isHumid = r.humidity > 80;
      const hasIssue = isHot || isHumid;
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="td-plate">' + (r.vehicleID || "—") + "</td>" +
        "<td>" + (r.temperature || "—") + " °C</td>" +
        "<td>—</td>" +
        '<td style="color:' + (isHumid ? "#5bc8f5" : "var(--text)") + '">' + (r.humidity || "—") + "%</td>" +
        '<td class="td-coords">' + (r.latitude ? r.latitude.toFixed(5) + "," + r.longitude.toFixed(5) : "—") + "</td>" +
        "<td>" + new Date(r.timestamp).toLocaleTimeString() + "</td>" +
        '<td><span class="status-badge ' + (hasIssue ? "status-delayed" : "status-transit") + '">' +
        (hasIssue ? "ALERT" : "NORMAL") + "</span></td>";
      table.appendChild(tr);
    });

    readingCount = records.length;
    document.getElementById("gaugeCount").textContent      = readingCount;
    document.getElementById("readingCountTag").textContent = readingCount + " READINGS";
  } catch (err) { console.warn("History load failed:", err); }
}

// ── CLEAR TABLE ──
function clearTable() {
  document.getElementById("sensorTable").innerHTML = "";
  readingCount = 0;
  document.getElementById("gaugeCount").textContent      = 0;
  document.getElementById("readingCountTag").textContent = "0 READINGS";
}

// ── FETCH LIVE & POLL ──
async function fetchSensorData() {
  try {
    const res  = await fetch(API_SUMMARY);
    const data = await res.json();

    const raw      = { temp: data.temp, humid: data.humidity, gps: data.gps };
    const filtered = applyFilter(data.temp, data.humidity);

    updateGauges(filtered, data.gps);
    updateChart(raw.temp, filtered.temp, filtered.humid);
    addTableRow(raw, filtered, "Fleet Vehicle");

    // Only alert on filtered values to avoid false alarms from noise
    if (Number(filtered.temp) > 30) {
      pushAlert("🌡 High temp: " + filtered.temp + "°C (filtered) — cargo risk!", "danger");
    }
    if (Number(filtered.humid) > 80) {
      pushAlert("💧 High humidity: " + filtered.humid + "% — spoilage risk!", "warn");
    }

  } catch (err) { console.error("Sensor fetch failed:", err); }
}

// ── DARK MODE ──
function toggleDark() { document.body.classList.toggle("dark"); }

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  loadVehicleFilter();
  loadHistory();
  fetchSensorData();
  setInterval(fetchSensorData, 5000);
});