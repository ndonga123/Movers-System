console.log("DASHBOARD JS LOADED");

const API = "https://movers-system.onrender.com/api";

let map, routeLine, lightLayer, darkLayer;
let currentRoute = [];
let progress     = 0;
let isDark       = false;
let activeVehicleName = "";

let movingDot   = null;
let startMarker = null;
let endMarker   = null;

// ── ROUTE DEVIATION SETTINGS ──
const DEVIATION_THRESHOLD_KM = 0.5;
let deviationAlerted = false;

// ── ALERT BADGE COUNT ──
let alertCount = 0;

// ── HAVERSINE DISTANCE ──
function haversineKm(lat1, lng1, lat2, lng2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── CHECK DEVIATION FROM ROUTE ──
function checkDeviation(currentLat, currentLng) {
  if (!currentRoute.length) return;
  let minDist = Infinity;
  for (const point of currentRoute) {
    const d = haversineKm(currentLat, currentLng, point[0], point[1]);
    if (d < minDist) minDist = d;
  }
  if (minDist > DEVIATION_THRESHOLD_KM && !deviationAlerted) {
    deviationAlerted = true;
    const distM = Math.round(minDist * 1000);
    pushAlert("📍", `Route deviation! ${activeVehicleName} is ${distM}m off route`);
    console.warn("ROUTE DEVIATION:", distM + "m from expected route");
  }
  if (minDist <= DEVIATION_THRESHOLD_KM) {
    deviationAlerted = false;
  }
}

// ── NOTIFICATIONS PANEL TOGGLE ──
document.addEventListener("DOMContentLoaded", () => {
  const notifyBtn = document.getElementById("notifyBtn");
  const panel     = document.getElementById("notifications");
  const badge     = document.getElementById("alertBadge");

  if (notifyBtn) {
    notifyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      panel.style.display = panel.style.display === "block" ? "none" : "block";
      // Clear badge when panel opened
      if (panel.style.display === "block") {
        alertCount = 0;
        if (badge) badge.style.display = "none";
      }
    });
  }
});

// ── PUSH ALERT — called automatically when events occur ──
let lastAlertMsg = "";
function pushAlert(icon, message) {
  const panel = document.getElementById("notifications");
  const list  = document.getElementById("alertList");
  const badge = document.getElementById("alertBadge");
  if (!panel || !list) return;

  // Prevent duplicate consecutive alerts
  const fullMsg = icon + " " + message;
  if (fullMsg === lastAlertMsg) return;
  lastAlertMsg = fullMsg;

  // Remove placeholder text
  const placeholder = list.querySelector("p");
  if (placeholder) placeholder.remove();

  const time = new Date().toLocaleTimeString();
  const item = document.createElement("div");
  item.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1a3020;font-family:'Space Mono',monospace;font-size:12px;";
  item.innerHTML =
    '<span style="color:#c8e6c9;">' + icon + " " + message + '</span>' +
    '<span style="color:#3a5a40;font-size:10px;margin-left:12px;white-space:nowrap;">' + time + '</span>';
  list.prepend(item);

  // Keep max 10 alerts
  while (list.children.length > 10) list.removeChild(list.lastChild);

  // Show panel automatically
  panel.style.display = "block";

  // Update badge count (shown when panel is hidden)
  alertCount++;
  if (badge) {
    badge.textContent   = alertCount;
    badge.style.display = "inline";
  }
}

// ── CLEAR ALERTS ──
function clearAlerts() {
  const list  = document.getElementById("alertList");
  const badge = document.getElementById("alertBadge");
  if (list)  list.innerHTML = '<p style="color:#5a7a5f;font-size:12px;font-family:\'Space Mono\',monospace;margin:0;">No alerts yet.</p>';
  if (badge) { badge.style.display = "none"; }
  alertCount   = 0;
  lastAlertMsg = "";
}

// ── DARK MODE + MAP TILES ──
function toggleDark() {
  document.body.classList.toggle("dark");
  isDark = document.body.classList.contains("dark");
  if (isDark) { map.removeLayer(lightLayer); darkLayer.addTo(map); }
  else        { map.removeLayer(darkLayer);  lightLayer.addTo(map); }
}

// ── CUSTOM ICONS ──
function makeIcon(color, label) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};color:#fff;border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,0.4);"><span style="transform:rotate(45deg)">${label}</span></div>`,
    iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -30]
  });
}

function makeDotIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="background:#5bc8f5;border:3px solid #fff;border-radius:50%;width:18px;height:18px;box-shadow:0 0 10px rgba(91,200,245,0.8),0 0 20px rgba(91,200,245,0.4);animation:pulse-dot 1.5s infinite;"></div><style>@keyframes pulse-dot{0%{box-shadow:0 0 0 0 rgba(91,200,245,0.6)}70%{box-shadow:0 0 0 10px rgba(91,200,245,0)}100%{box-shadow:0 0 0 0 rgba(91,200,245,0)}}</style>`,
    iconSize: [18, 18], iconAnchor: [9, 9]
  });
}

// ── SUMMARY (temp + humidity alerts) ──
async function loadSummary() {
  try {
    const res  = await fetch(`${API}/summary`);
    const data = await res.json();
    document.getElementById("gps").textContent  = data.gps;
    document.getElementById("temp").textContent = data.temp + " °C";
    document.getElementById("hum").textContent  = data.humidity + " %";
    updateChart(data.temp, data.humidity);

    if (data.temp > 30)     pushAlert("🌡️", `High temperature: ${data.temp}°C`);
    if (data.humidity > 80) pushAlert("💧", `High humidity: ${data.humidity}%`);
  } catch (err) {
    console.error("FAILED TO LOAD SUMMARY:", err);
  }
}

// ── VEHICLES ──
async function loadVehicleList() {
  try {
    const res      = await fetch(`${API}/vehicles`);
    const vehicles = await res.json();
    const list     = document.getElementById("vehicleList");
    list.innerHTML = "";

    const activeEl = document.getElementById("activeVehicles");
    if (activeEl) activeEl.textContent = vehicles.length;

    vehicles.forEach(v => {
      const card = document.createElement("div");
      card.className = "vehicle-card";
      card.innerHTML = `
        <div class="vehicle-name">🚛 ${v.name}</div>
        <div class="vehicle-route">${v.from || "—"} → ${v.to || "—"}</div>
        <div class="vehicle-actions">
          <button class="delete-btn">🗑 Delete</button>
        </div>`;

      card.addEventListener("click", () => {
        if (!v.route || v.route.length < 3) {
          pushAlert("⚠️", `${v.name} has no route set yet`);
          return;
        }
        if (routeLine)   map.removeLayer(routeLine);
        if (startMarker) map.removeLayer(startMarker);
        if (endMarker)   map.removeLayer(endMarker);
        if (movingDot)   map.removeLayer(movingDot);

        const coords = v.route.map(p => [parseFloat(p.lat), parseFloat(p.lng)]);
        routeLine = L.polyline(coords, { color: "#3ddc6e", weight: 4, opacity: 0.8 }).addTo(map);
        map.fitBounds(routeLine.getBounds());
        startMarker = L.marker(coords[0], { icon: makeIcon("#3ddc6e", "A") }).addTo(map).bindPopup(`<b>🟢 From</b><br>${v.from || "Start"}`).openPopup();
        endMarker   = L.marker(coords[coords.length - 1], { icon: makeIcon("#e84545", "B") }).addTo(map).bindPopup(`<b>🔴 To</b><br>${v.to || "Destination"}`);
        movingDot   = L.marker(coords[0], { icon: makeDotIcon() }).addTo(map);

        currentRoute      = coords;
        progress          = 0;
        deviationAlerted  = false;
        activeVehicleName = v.name;

        const label = document.getElementById("routeLabel");
        if (label) label.textContent = `${v.name}: ${v.from} → ${v.to}`;
        pushAlert("📍", `Now tracking ${v.name}`);
      });

      card.querySelector(".delete-btn").addEventListener("click", e => {
        e.stopPropagation();
        deleteVehicle(v._id, v.name);
      });

      list.appendChild(card);
    });
  } catch (err) {
    console.error("FAILED TO LOAD VEHICLES:", err);
  }
}

// ── DELETE ──
function deleteVehicle(id, name) {
  if (!confirm(`Delete vehicle "${name}"?`)) return;
  fetch(`${API}/vehicles/${id}`, { method: "DELETE" }).then(() => {
    loadVehicleList();
    if (routeLine)   { map.removeLayer(routeLine);   routeLine   = null; }
    if (startMarker) { map.removeLayer(startMarker); startMarker = null; }
    if (endMarker)   { map.removeLayer(endMarker);   endMarker   = null; }
    if (movingDot)   { map.removeLayer(movingDot);   movingDot   = null; }
    currentRoute = [];
    progress     = 0;
  });
}

// ── CHART ──
let sensorChart;
const tempData = [];
const humData  = [];
const labels   = [];

function initChart() {
  const ctx = document.getElementById("sensorChart").getContext("2d");
  sensorChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Temp °C",    data: tempData, borderColor: "#e84545", backgroundColor: "rgba(232,69,69,0.08)",  tension: 0.4, fill: true, pointRadius: 3 },
        { label: "Humidity %", data: humData,  borderColor: "#5bc8f5", backgroundColor: "rgba(91,200,245,0.08)", tension: 0.4, fill: true, pointRadius: 3 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#5a7a5f", font: { family: "Space Mono", size: 10 } } } },
      scales: {
        x: { ticks: { color: "#5a7a5f", font: { family: "Space Mono", size: 9 } }, grid: { color: "#1e3022" } },
        y: { ticks: { color: "#5a7a5f", font: { family: "Space Mono", size: 9 } }, grid: { color: "#1e3022" } }
      }
    }
  });
}

function updateChart(temp, hum) {
  const now = new Date().toLocaleTimeString();
  labels.push(now);
  tempData.push(Number(temp));
  humData.push(Number(hum));
  if (labels.length > 8) { labels.shift(); tempData.shift(); humData.shift(); }
  sensorChart.update();
}

// ── MAP ──
function initMap() {
  map = L.map("map").setView([-1.2921, 36.8219], 7);
  lightLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" });
  darkLayer  = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: "© OpenStreetMap © CARTO" });
  lightLayer.addTo(map);
}

// ── SMOOTH MOVEMENT + DEVIATION CHECK ──
function moveVehicle() {
  if (!currentRoute.length || !movingDot) return;
  const steps = 900;
  progress++;
  let t = progress / steps;
  if (t >= 1) { progress = 0; t = 0; }
  const i    = Math.floor(t * (currentRoute.length - 1));
  const p1   = currentRoute[i];
  const p2   = currentRoute[i + 1] || p1;
  const frac = (t * currentRoute.length) % 1;
  const lat  = p1[0] + (p2[0] - p1[0]) * frac;
  const lng  = p1[1] + (p2[1] - p1[1]) * frac;
  movingDot.setLatLng([lat, lng]);
  if (progress % 10 === 0) checkDeviation(lat, lng);
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  initMap();
  loadSummary();
  loadVehicleList();
  setInterval(loadSummary, 5000);
  setInterval(moveVehicle, 1000);
});