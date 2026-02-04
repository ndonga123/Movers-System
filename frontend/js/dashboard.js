console.log("DASHBOARD CONNECTED");

// API base
const API = "https://movers-system.onrender.com/api";

// Elements
const gpsEl = document.getElementById("gps");
const tempEl = document.getElementById("temp");
const humEl  = document.getElementById("hum");

// Leaflet map
const map = L.map("map").setView([-1.2921, 36.8219], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

const marker = L.marker([-1.2921, 36.8219]).addTo(map);

// Chart
const ctx = document.getElementById("sensorChart");
let labels = [];
let tempData = [];
let humData = [];

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels,
    datasets: [
      { label: "Temp °C", data: tempData, borderWidth: 2, tension: 0.4 },
      { label: "Humidity %", data: humData, borderWidth: 2, tension: 0.4 }
    ]
  },
  options: { responsive: true }
});

// Poll backend every 3 seconds
async function fetchSummary() {
  try {
    const res = await fetch(`${API}/summary`);
    const data = await res.json();

    gpsEl.innerText = data.gps;
    tempEl.innerText = data.temp + "°C";
    humEl.innerText  = data.humidity + "%";

    const [lat, lng] = data.gps.split(",").map(Number);
    marker.setLatLng([lat, lng]);
    map.panTo([lat, lng]);

    labels.push(new Date().toLocaleTimeString().slice(0,5));
    tempData.push(data.temp);
    humData.push(data.humidity);

    if (labels.length > 8) {
      labels.shift();
      tempData.shift();
      humData.shift();
    }

    chart.update();

  } catch (err) {
    console.error("API error:", err);
  }
}

setInterval(fetchSummary, 3000);
fetchSummary();
