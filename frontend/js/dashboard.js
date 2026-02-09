console.log("DASHBOARD JS LOADED");
const API = "https://movers-system.onrender.com/api";
async function loadVehicles() {
  const res = await fetch("https://movers-system.onrender.com/api/vehicles");
  const vehicles = await res.json();

  const list = document.getElementById("vehicleList");
  list.innerHTML = "";

  vehicles.forEach(v => {
    const li = document.createElement("li");
    li.textContent = `${v.name} (${v.lat}, ${v.lng})`;
    list.appendChild(li);
  });
}


// ---------------- DARK MODE ----------------
function toggleDark() {
  document.body.classList.toggle("dark");
}

// ---------------- SUMMARY ----------------
async function loadSummary() {
  try {
    const res = await fetch("https://movers-system.onrender.com/api/summary");
    const data = await res.json();

    console.log("API DATA:", data);

    document.getElementById("gps").textContent = data.gps;
    document.getElementById("temp").textContent = data.temp + " °C";
    document.getElementById("hum").textContent = data.humidity + " %";

    updateChart(data.temp, data.humidity);
    updateMap(data.gps);

  } catch (err) {
    console.error("FAILED TO LOAD SUMMARY:", err);
  }
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
let map, marker, routeLine;

function initMap() {
  map = L.map("map").setView([-1.2921, 36.8219], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  marker = L.marker([-1.2921, 36.8219]).addTo(map);
}

// Nairobi → Nakuru path
const routeCoords = [
  [-1.2921, 36.8219], // Nairobi
  [-1.1500, 36.8000],
  [-0.9500, 36.8500],
  [-0.7000, 36.7000],
  [-0.3031, 36.0800]  // Nakuru
];

let routeIndex = 0;

function drawRoute() {
  routeLine = L.polyline(routeCoords, { color: "blue" }).addTo(map);
  map.fitBounds(routeLine.getBounds());
}

function moveVehicle() {
  if (routeIndex >= routeCoords.length) routeIndex = 0;

  const [lat, lng] = routeCoords[routeIndex];
  marker.setLatLng([lat, lng]);
  map.setView([lat, lng], 10);

  routeIndex++;
}

// call every 3 seconds
setInterval(moveVehicle, 3000);


// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  initMap();
  drawRoute();
  loadSummary();
  loadVehicles();
  li.onclick = () => {
  routeIndex = 0;
  moveVehicle();
};

  setInterval(loadSummary, 5000);
});
