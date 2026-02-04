const gpsEl = document.getElementById("gps");
const tempEl = document.getElementById("temp");
const humEl = document.getElementById("hum");

// MAP
const map = L.map("map").setView([-1.2921, 36.8219], 14);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

let marker = L.marker([-1.2921, 36.8219]).addTo(map);
let polyline = L.polyline([], { color: "#3b82f6", weight: 4 }).addTo(map);

// CHART
const ctx = document.getElementById("sensorChart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Temp °C", data: [], borderWidth: 2 },
      { label: "Humidity %", data: [], borderWidth: 2 }
    ]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: "top" } }
  }
});

// API URL (CHANGE ONLY THIS IF NEEDED)
const API = "https://movers-system.onrender.com/api/summary";

async function updateDashboard() {
  try {
    const res = await fetch(API);
    const data = await res.json();

    gpsEl.textContent = `${data.lat}, ${data.lng}`;
    tempEl.textContent = data.temp + "°C";
    humEl.textContent = data.humidity + "%";

    const pos = [data.lat, data.lng];
    marker.setLatLng(pos);
    polyline.addLatLng(pos);
    map.panTo(pos);

    chart.data.labels.push(new Date().toLocaleTimeString().slice(0,5));
    chart.data.datasets[0].data.push(data.temp);
    chart.data.datasets[1].data.push(data.humidity);

    if (chart.data.labels.length > 8) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(d => d.data.shift());
    }

    chart.update();
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }
}

setInterval(updateDashboard, 3000);
