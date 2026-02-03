// ================= MAP =================
const map = L.map("map").setView([-1.2921, 36.8219], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

const marker = L.marker([-1.2921, 36.8219]).addTo(map);

// Fake Nairobi route
const route = [
  [-1.2997, 36.8219],
  [-1.2965, 36.8260],
  [-1.2940, 36.8295],
  [-1.2915, 36.8322],
  [-1.2890, 36.8350],
  [-1.2865, 36.8380],
];

let routeIndex = 0;

// ================= GPS + SENSOR SIM =================
setInterval(() => {
  const lat = (-1.2997 + Math.random() * 0.01).toFixed(5);
  const lng = (36.8219 + Math.random() * 0.01).toFixed(5);

  document.getElementById("gps").innerText = `${lat}, ${lng}`;

  const t = (20 + Math.random() * 10).toFixed(1);
  const h = (50 + Math.random() * 30).toFixed(1);

  document.getElementById("temp").innerText = `${t}°C`;
  document.getElementById("hum").innerText = `${h}%`;
}, 2000);

// ================= MOVE VEHICLE =================
setInterval(() => {
  routeIndex = (routeIndex + 1) % route.length;
  const [lat, lng] = route[routeIndex];

  marker.setLatLng([lat, lng]);
  map.panTo([lat, lng]);

  document.getElementById("gps").innerText =
    lat.toFixed(5) + ", " + lng.toFixed(5);
}, 3000);

// ================= CHART =================
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
      },
      {
        label: "Humidity %",
        data: humData,
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
  },
});

// ================= LIVE CHART UPDATE =================
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

  document.getElementById("temp").innerText = newTemp.toFixed(1) + "°C";
  document.getElementById("hum").innerText = newHum.toFixed(1) + "%";

  chart.update();
}, 3000);
