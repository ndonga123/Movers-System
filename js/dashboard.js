const API_BASE = "http://localhost:5000/api"; 
// Change to your Render backend URL when deployed
// const API_BASE = "https://your-render-backend.onrender.com/api";

// Authentication
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const headers = { "Authorization": `Bearer ${token}` };

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

// DOM elements
const vehicleTable = document.getElementById("vehicleTable").querySelector("tbody");
const sensorTable = document.getElementById("sensorTable").querySelector("tbody");

// Fetch vehicles
async function loadVehicles() {
  try {
    const res = await fetch(`${API_BASE}/vehicles`, { headers });
    if (res.status === 401) return logout();

    const vehicles = await res.json();
    vehicleTable.innerHTML = vehicles.length 
      ? vehicles.map(v => `<tr>
          <td>${v.vehicle_id}</td>
          <td>${v.driver_name}</td>
          <td>${v.status}</td>
        </tr>`).join('')
      : `<tr><td colspan="3">No vehicles found</td></tr>`;
  } catch (err) {
    vehicleTable.innerHTML = `<tr><td colspan="3">Error loading vehicles</td></tr>`;
    console.error(err);
  }
}

// Fetch sensor readings
async function loadSensors() {
  try {
    const res = await fetch(`${API_BASE}/sensors`, { headers });
    if (res.status === 401) return logout();

    const sensors = await res.json();
    sensorTable.innerHTML = sensors.length 
      ? sensors.map(s => `<tr>
          <td>${s.vehicle_id}</td>
          <td>${s.temperature} °C</td>
          <td>${s.humidity} %</td>
          <td>${s.latitude}, ${s.longitude}</td>
          <td>${new Date(s.timestamp).toLocaleString()}</td>
        </tr>`).join('')
      : `<tr><td colspan="5">No sensor data found</td></tr>`;
  } catch (err) {
    sensorTable.innerHTML = `<tr><td colspan="5">Error loading sensor data</td></tr>`;
    console.error(err);
  }
}

// Auto-refresh every 10 seconds
function refresh() {
  loadVehicles();
  loadSensors();
}

refresh();
setInterval(refresh, 10000);

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
