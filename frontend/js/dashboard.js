function toggleDark() {
  document.body.classList.toggle("dark");
}
// ========== MAP SETUP ==========
const map = L.map("map").setView([-1.2997, 36.8219], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const routeControl = L.Routing.control({
  waypoints: [
    L.latLng(-1.2997, 36.8219),
    L.latLng(-1.2965, 36.8260),
    L.latLng(-1.2940, 36.8295),
    L.latLng(-1.2915, 36.8322),
    L.latLng(-1.2890, 36.8350),
  ],
  routeWhileDragging: false,
  show: false,
  addWaypoints: false
}).addTo(map);

let index = 0;

// Move marker along route
setInterval(() => {
  index = (index + 1) % route.length;
  const [lat, lng] = route[index];

  marker.setLatLng([lat, lng]);
  map.panTo([lat, lng]);

  document.getElementById("gps").innerText =
    lat.toFixed(5) + ", " + lng.toFixed(5);
}, 3000);

// ========== SENSOR SIMULATION ==========
setInterval(() => {
  document.getElementById("temp").innerText =
    (20 + Math.random() * 10).toFixed(1) + "°C";

  document.getElementById("hum").innerText =
    (50 + Math.random() * 20).toFixed(1) + "%";
}, 2000);

// ========== CHART ==========
const ctx = document.getElementById("sensorChart");

let tempData = [25, 26, 27, 26, 28];
let humData = [60, 62, 65, 64, 69];
let labels = ["10:00", "10:03", "10:06", "10:09", "10:12"];

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Temperature °C",
        data: tempData,
        borderWidth: 2,
        tension: 0.4,
        fill: false
      },
      {
        label: "Humidity %",
        data: humData,
        borderWidth: 2,
        tension: 0.4,
        fill: false
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: false }
    },
    plugins: {
      legend: {
        labels: { color: "#333" }
      }
    }
  }
});

// Live updates
setInterval(() => {
  const newTemp = 24 + Math.random() * 6;
  const newHum = 55 + Math.random() * 20;

  tempData.push(newTemp);
  humData.push(newHum);
  labels.push(new Date().toLocaleTimeString().slice(0, 5));

  if (tempData.length > 8) {
    tempData.shift();
    humData.shift();
    labels.shift();
  }

  document.getElementById("temp").innerText = newTemp.toFixed(1);
  document.getElementById("hum").innerText = newHum.toFixed(1);

  chart.update();
}, 3000);
