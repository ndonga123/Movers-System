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
  const res = await fetch(`${API}/vehicles`);
  const vehicles = await res.json();

  const list = document.getElementById("vehicleList");
  list.innerHTML = "";

  vehicles.forEach(v => {
    const li = document.createElement("li");
    li.textContent = `${v.name} | ${v.from} → ${v.to}`;

    li.onclick = () => {
      if (!v.route || v.route.length === 0) return;

      if (routeLine) map.removeLayer(routeLine);

      currentRoute = v.route.map(p => [p.lat, p.lng]);
      routeIndex = 0;

      routeLine = L.polyline(currentRoute, { color: "blue" }).addTo(map);
      map.fitBounds(routeLine.getBounds());
    };

    list.appendChild(li);
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
