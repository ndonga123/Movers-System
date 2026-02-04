const API = "https://movers-system.onrender.com/api/summary";

/* ---------- STATS ---------- */
async function loadSummary() {
  try {
    const res = await fetch(API);
    const data = await res.json();

    const [lat, lng] = data.gps.split(",");

    document.getElementById("gps").innerText = data.gps;
    document.getElementById("temp").innerText = data.temp + "°C";
    document.getElementById("hum").innerText = data.humidity + "%";

    moveVehicle(parseFloat(lat), parseFloat(lng));
    updateChart(parseFloat(data.temp), parseFloat(data.humidity));
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

setInterval(loadSummary, 3000);
loadSummary();

/* ---------- MAP ---------- */
const map = L.map("map").setView([-1.2997, 36.8219], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

let marker = L.marker([-1.2997, 36.8219]).addTo(map);
let path = L.polyline([], { color: "blue" }).addTo(map);

function moveVehicle(lat, lng) {
  const pos = [lat, lng];
  marker.setLatLng(pos);
  path.addLatLng(pos);
  map.panTo(pos, { animate: true, duration: 0.5 });
}

/* ---------- CHART ---------- */
const ctx = document.getElementById("sensorChart").getContext("2d");

let labels = [];
let tempData = [];
let humData = [];

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: tempData,
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: "Humidity (%)",
        data: humData,
        borderWidth: 2,
        tension: 0.4
      }
    ]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      y: { beginAtZero: false }
    }
  }
});

function updateChart(temp, hum) {
  const time = new Date().toLocaleTimeString().slice(0, 5);

  labels.push(time);
  tempData.push(temp);
  humData.push(hum);

  if (labels.length > 10) {
    labels.shift();
    tempData.shift();
    humData.shift();
  }

  chart.update();
}
