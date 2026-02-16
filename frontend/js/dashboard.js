console.log("DASHBOARD JS LOADED");

const API = "https://movers-system.onrender.com/api";

let map, marker, routeLine;
let currentRoute = [];
let routeIndex = 0;
let progress = 0;

// ---------------- NOTIFICATIONS ----------------
const notifyBtn = document.getElementById("notifyBtn");
const panel = document.getElementById("notifications");

if (notifyBtn) {
  notifyBtn.onclick = () => {
    panel.style.display =
      panel.style.display === "block" ? "none" : "block";
  };
}

function pushNotification(msg) {
  const p = document.createElement("p");
  p.textContent = msg;
  panel.prepend(p);
}

// ---------------- DARK MODE ----------------
function toggleDark() {
  document.body.classList.toggle("dark");
}

// ---------------- SUMMARY ----------------
async function loadSummary() {
  try {
    const res = await fetch(`${API}/summary`);
    const data = await res.json();

    document.getElementById("gps").textContent = data.gps;
    document.getElementById("temp").textContent = data.temp + " °C";
    document.getElementById("hum").textContent = data.humidity + " %";

    updateChart(data.temp, data.humidity);

    // alerts
    if (data.temp > 30) pushNotification("🔥 High temperature!");
    if (data.humidity > 80) pushNotification("💧 High humidity!");

  } catch (err) {
    console.error("FAILED TO LOAD SUMMARY:", err);
  }
}

// ---------------- VEHICLES ----------------
async function loadVehicleList() {
  try {
    const res = await fetch(`${API}/vehicles`);
    const vehicles = await res.json();

    const list = document.getElementById("vehicleList");
    list.innerHTML = "";

    vehicles.forEach(v => {
      const card = document.createElement("div");
      card.className = "vehicle-card";

      card.innerHTML = `
        <div class="vehicle-name">${v.name}</div>
        <div class="vehicle-route">${v.from} → ${v.to}</div>
        <div class="vehicle-actions">
          <button class="delete-btn">🗑</button>
        </div>
      `;

      // click to show route
      card.addEventListener("click", () => {
        if (!v.route || !v.route.length) return;

        if (routeLine) map.removeLayer(routeLine);

        const coords = v.route.map(p => [p.lat, p.lng]);
        routeLine = L.polyline(coords, {
          color: "#00e5ff",
          weight: 4
        }).addTo(map);

        map.fitBounds(routeLine.getBounds());

        currentRoute = coords;
        routeIndex = 0;
        progress = 0;
        marker.setLatLng(coords[0]);
      });

      // delete
      card.querySelector(".delete-btn").addEventListener("click", e => {
        e.stopPropagation();
        deleteVehicle(v._id);
      });

      list.appendChild(card);
    });

  } catch (err) {
    console.error("FAILED TO LOAD VEHICLES:", err);
  }
}

// ---------------- DELETE ----------------
function deleteVehicle(id) {
  fetch(`${API}/vehicles/${id}`, { method: "DELETE" })
    .then(() => loadVehicleList());
}

// ---------------- CHART ----------------
let sensorChart;
const tempData = [];
const humData = [];
const labels = [];

function initChart() {
  const ctx = document.getElementById("sensorChart").getContext("2d");

  sensorChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Temp °C", data: tempData },
        { label: "Humidity %", data: humData }
      ]
    }
  });
}

function updateChart(temp, hum) {
  const now = new Date().toLocaleTimeString();

  labels.push(now);
  tempData.push(Number(temp));
  humData.push(Number(hum));

  if (labels.length > 8) {
    labels.shift();
    tempData.shift();
    humData.shift();
  }

  sensorChart.update();
}

// ---------------- MAP ----------------
function initMap() {
  map = L.map("map").setView([-1.2921, 36.8219], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  marker = L.marker([-1.2921, 36.8219]).addTo(map);
}

// ---------------- SMOOTH MOVEMENT ----------------
function moveVehicle() {
  if (!currentRoute.length) return;

  const steps = 900; // 15 min demo
  progress++;

  let t = progress / steps;
  if (t >= 1) {
    progress = 0;
    t = 0;
  }

  const i = Math.floor(t * (currentRoute.length - 1));
  const p1 = currentRoute[i];
  const p2 = currentRoute[i + 1] || p1;

  const frac = (t * currentRoute.length) % 1;

  const lat = p1[0] + (p2[0] - p1[0]) * frac;
  const lng = p1[1] + (p2[1] - p1[1]) * frac;

  marker.setLatLng([lat, lng]);
}

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  initMap();
  loadSummary();
  loadVehicleList();

  setInterval(loadSummary, 5000);
  setInterval(moveVehicle, 1000);
});
