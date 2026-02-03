console.log("Dashboard loaded");

// ===== DARK MODE =====
function toggleDark() {
  document.body.classList.toggle("dark");
}

// ===== LIVE SENSORS =====
setInterval(() => {
  const lat = currentPoint[0].toFixed(5);
  const lng = currentPoint[1].toFixed(5);

  document.getElementById("gps").innerText = lat + ", " + lng;
  document.getElementById("temp").innerText = (22 + Math.random() * 6).toFixed(1) + "°C";
  document.getElementById("hum").innerText = (55 + Math.random() * 20).toFixed(1) + "%";
}, 2000);

// ===== CHART =====
const ctx = document.getElementById("sensorChart");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Temp °C", data: [], tension: 0.4 },
      { label: "Humidity %", data: [], tension: 0.4 }
    ]
  },
  options: {
    responsive: true,
    scales: { y: { beginAtZero: false } }
  }
});

setInterval(() => {
  chart.data.labels.push(new Date().toLocaleTimeString().slice(0,5));
  chart.data.datasets[0].data.push(22 + Math.random() * 6);
  chart.data.datasets[1].data.push(55 + Math.random() * 20);

  if (chart.data.labels.length > 8) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
  }

  chart.update();
}, 3000);

// ===== MAP + ROAD FOLLOWING =====
const map = L.map("map").setView([-1.2997, 36.8219], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// Start & End (Nairobi)
const start = L.latLng(-1.2997, 36.8219);
const end   = L.latLng(-1.2865, 36.8380);

let currentPoint = [start.lat, start.lng];

const routeControl = L.Routing.control({
  waypoints: [start, end],
  lineOptions: { styles: [{ weight: 5 }] },
  addWaypoints: false,
  draggableWaypoints: false,
  show: false
}).addTo(map);

let routeCoords = [];
let step = 0;
let marker = L.marker(start).addTo(map);

routeControl.on("routesfound", e => {
  routeCoords = e.routes[0].coordinates;
});

// Move vehicle smoothly on real road
setInterval(() => {
  if (routeCoords.length === 0) return;

  step = (step + 1) % routeCoords.length;
  const p = routeCoords[step];

  marker.setLatLng([p.lat, p.lng]);
  map.panTo([p.lat, p.lng], { animate: true });

  currentPoint = [p.lat, p.lng];
}, 1500);
