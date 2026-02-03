// ================= MAP + ROAD ROUTING =================
const map = L.map("map").setView([-1.2921, 36.8219], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

const routeControl = L.Routing.control({
  waypoints: [
    L.latLng(-1.2997, 36.8219),
    L.latLng(-1.2865, 36.8380),
  ],
  routeWhileDragging: false,
  addWaypoints: false,
  draggableWaypoints: false,
  show: false,
}).addTo(map);

let routeLine = null;
let routeCoords = [];
let index = 0;

routeControl.on("routesfound", function (e) {
  routeCoords = e.routes[0].coordinates;

  routeLine = L.polyline(routeCoords, { weight: 4 }).addTo(map);

  marker = L.marker(routeCoords[0]).addTo(map);
});

// ================= LIVE VEHICLE =================
setInterval(() => {
  if (!routeCoords.length) return;

  index = (index + 5) % routeCoords.length;
  const pos = routeCoords[index];

  marker.setLatLng(pos);
  map.panTo(pos);

  document.getElementById("gps").innerText =
    pos.lat.toFixed(5) + ", " + pos.lng.toFixed(5);
}, 2000);

// ================= SENSOR DATA =================
const gpsEl = document.getElementById("gps");
const tempEl = document.getElementById("temp");
const humEl = document.getElementById("hum");

setInterval(() => {
  const temp = 20 + Math.random() * 10;
  const hum = 50 + Math.random() * 30;

  tempEl.innerText = temp.toFixed(1) + "°C";
  humEl.innerText = hum.toFixed(1) + "%";
}, 2500);

// ================= CHART =================
const ctx = document.getElementById("sensorChart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: ["10:00", "10:05", "10:10", "10:15", "10:20"],
    datasets: [
      {
        label: "Temperature °C",
        data: [24, 26, 25, 27, 28],
        tension: 0.4,
      },
      {
        label: "Humidity %",
        data: [55, 60, 58, 63, 65],
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
  },
});

// ================= LIVE CHART =================
setInterval(() => {
  chart.data.labels.push(new Date().toLocaleTimeString().slice(0, 5));

  chart.data.datasets[0].data.push(20 + Math.random() * 10);
  chart.data.datasets[1].data.push(50 + Math.random() * 30);

  if (chart.data.labels.length > 8) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
  }

  chart.update();
}, 3000);
