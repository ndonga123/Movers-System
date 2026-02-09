console.log("DASHBOARD JS LOADED");
const API = "https://movers-system.onrender.com/api";
async function loadVehicles() {
  try {
    const res = await fetch(API + "/vehicles");
    const vehicles = await res.json();

    const list = document.getElementById("vehicleList");
    list.innerHTML = "";

    vehicles.forEach(v => {
      const li = document.createElement("li");
      li.textContent = `${v.name} | ${v.from} → ${v.to}`;
      list.appendChild(li);
    });

  } catch (err) {
    console.error("FAILED TO LOAD VEHICLES:", err);
  }
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
let map, marker;

function initMap() {
  map = L.map("map").setView([-1.2921, 36.8219], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  marker = L.marker([-1.2921, 36.8219]).addTo(map);
}

function updateMap(gps) {
  const [lat, lng] = gps.split(",").map(Number);

  marker.setLatLng([lat, lng]);
  map.setView([lat, lng], 14);
}

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  initMap();
  loadSummary();
  loadVehicles();          // 👈 ADD THIS
  setInterval(loadSummary, 5000);
});
