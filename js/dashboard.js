// CHANGE THIS when deployed to Render
const API_BASE = "http://localhost:5000/api";
// Example after hosting:
// const API_BASE = "https://your-render-url.onrender.com/api";

// DOM elements
const vehicleTable = document.getElementById("vehicleTable");
const sensorTable = document.getElementById("sensorTable");

// Fetch vehicles
async function loadVehicles() {
  try {
    const res = await fetch(`${API_BASE}/vehicles`);
    const vehicles = await res.json();

    vehicleTable.innerHTML = "";

    vehicles.forEach(v => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${v.vehicle_id}</td>
        <td>${v.driver_name}</td>
        <td>${v.status}</td>
      `;
      vehicleTable.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading vehicles:", err);
  }
}

// Fetch sensor readings
async function loadSensors() {
  try {
    const res = await fetch(`${API_BASE}/sensors`);
    const sensors = await res.json();

    sensorTable.innerHTML = "";

    sensors.forEach(s => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.vehicle_id}</td>
        <td>${s.temperature} °C</td>
        <td>${s.humidity} %</td>
        <td>${s.latitude}, ${s.longitude}</td>
        <td>${new Date(s.timestamp).toLocaleString()}</td>
      `;
      sensorTable.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading sensors:", err);
  }
}

// Load data on page load
loadVehicles();
loadSensors();

// Auto refresh every 10 seconds
setInterval(() => {
  loadVehicles();
  loadSensors();
}, 10000);
