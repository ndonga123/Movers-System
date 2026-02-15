console.log("DASHBOARD JS LOADED");

const API = "https://movers-system.onrender.com/api";

let map, marker, routeLine;
let currentRoute = [];
let routeIndex = 0;
let progress = 0;
const notifyBtn = document.getElementById("notifyBtn");
const panel = document.getElementById("notifications");

notifyBtn.onclick = () => {
  panel.style.display =
    panel.style.display === "block" ? "none" : "block";
};

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
  } catch (err) {
    console.error("FAILED TO LOAD SUMMARY:", err);
  }
  if (data.temp > 30) pushNotification("🔥 High temperature!");
if (data.humidity > 80) pushNotification("💧 High humidity!");

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
          <button onclick="deleteVehicle('${v._id}')">🗑</button>
        </div>
      `;

      card.addEventListener("click", () => {
        if (!v.route || !v.route.length) return;

        if (routeLine) map.removeLayer(routeLine);

        const coords = v.route.map(p => [p.lat, p.lng]);
        routeLine = L.polyline(coords, { color: "#00e5ff", weight: 4 }).addTo(map);
        map.fitBounds(routeLine.getBounds());

        currentRoute = coords;
        routeIndex = 0;
        progress = 0;

        marker.setLatLng(coords[0]);

        document.getElementById("routeLabel").textContent =
          `${v.name}: ${v.from} → ${v.to}`;
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

// ---------------- REALISTIC MOVE ----------------
function moveVehicle() {
  let t = 0;

function moveVehicle() {
  if (!currentRoute.length) return;

  const total = currentRoute.length - 1;
  const i = Math.floor(t);
  const frac = t - i;

  if (i >= total) {
    t = 0;
    return;
  }

  const [lat1, lng1] = currentRoute[i];
  const [lat2, lng2] = currentRoute[i + 1];

  const lat = lat1 + (lat2 - lat1) * frac;
  const lng = lng1 + (lng2 - lng1) * frac;

  marker.setLatLng([lat, lng]);

  t += 0.01; // smaller = smoother, slower
}

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
