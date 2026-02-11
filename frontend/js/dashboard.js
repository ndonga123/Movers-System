console.log("DASHBOARD JS LOADED");

const API = "https://movers-system.onrender.com/api";

let map, marker, routeLine;
let currentRoute = [];
let routeIndex = 0;

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
}

// ---------------- VEHICLES ----------------
async function loadVehicleList() {
  const res = await fetch("https://movers-system.onrender.com/api/vehicles");
  const vehicles = await res.json();

  const list = document.getElementById("vehicleList");
  list.innerHTML = "";

  vehicles.forEach(v => {
    const card = document.createElement("div");
    card.className = "vehicle-card";

    card.innerHTML = `
      <div class="vehicle-name">${v.name}</div>
      <div class="vehicle-route">${v.from} → ${v.to}</div>
    `;

    card.onclick = () => {
      card.onclick = () => {
  if (!v.route || !v.route.length) return;

  if (routeLine) map.removeLayer(routeLine);

  const coords = v.route.map(p => [p.lat, p.lng]);

  routeLine = L.polyline(coords, { color: "#00e5ff", weight: 4 }).addTo(map);
  map.fitBounds(routeLine.getBounds());

  currentRoute = coords;
  routeIndex = 0;

  // move marker to start
  marker.setLatLng(coords[0]);

  document.getElementById("routeLabel").textContent =
    `${v.name}: ${v.from} → ${v.to}`;
};

    };

    list.appendChild(card);
  });
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

// move along selected route
function moveVehicle() {
  if (!currentRoute.length) return;

  if (routeIndex >= currentRoute.length) routeIndex = 0;

  const [lat, lng] = currentRoute[routeIndex];
  marker.setLatLng([lat, lng]);
  map.setView([lat, lng], 10);

  routeIndex++;
}

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  initMap();
  loadSummary();
  loadVehicleList();

  setInterval(loadSummary, 5000);
  setInterval(moveVehicle, 3000);
});
