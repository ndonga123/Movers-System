console.log("DASHBOARD JS LOADED");

const API = "https://movers-system.onrender.com/api";

let map, marker, routeLine;
let currentRoute = [];
let progress = 0;

// ---------------- NOTIFICATIONS ----------------
const notifyBtn = document.getElementById("notifyBtn");
const panel = document.getElementById("notifications");
let lastAlert = "";

if (notifyBtn) {
  notifyBtn.onclick = () => {
    panel.style.display =
      panel.style.display === "block" ? "none" : "block";
  };
}

function pushNotification(msg) {
  if (!panel) return;
  if (msg === lastAlert) return;

  lastAlert = msg;
  panel.style.display = "block";

  const p = document.createElement("p");
  p.textContent = msg;
  p.className = "alert-msg";
  panel.prepend(p);
}

// ---------------- DARK MODE ----------------
function toggleDark() {
  document.body.classList.toggle("dark");
}

// ---------------- SUMMARY ----------------
async function loadSummary() {
  try {
    const res  = await fetch(`${API}/summary`);
    const data = await res.json();

    document.getElementById("gps").textContent  = data.gps;
    document.getElementById("temp").textContent = data.temp + " °C";
    document.getElementById("hum").textContent  = data.humidity + " %";

    updateChart(data.temp, data.humidity);

    if (data.temp > 30)     pushNotification("🔥 High temperature!");
    if (data.humidity > 80) pushNotification("💧 High humidity!");

  } catch (err) {
    console.error("FAILED TO LOAD SUMMARY:", err);
  }
}

// ---------------- VEHICLES ----------------
async function loadVehicleList() {
  try {
    const res      = await fetch(`${API}/vehicles`);
    const vehicles = await res.json();

    const list = document.getElementById("vehicleList");
    list.innerHTML = "";

    // Update active vehicles count
    const activeEl = document.getElementById("activeVehicles");
    if (activeEl) activeEl.textContent = vehicles.length;

    vehicles.forEach(v => {
      const card = document.createElement("div");
      card.className = "vehicle-card";

      card.innerHTML = `
        <div class="vehicle-name">🚛 ${v.name}</div>
        <div class="vehicle-route">${v.from || "—"} → ${v.to || "—"}</div>
        <div class="vehicle-actions">
          <button class="delete-btn">🗑 Delete</button>
        </div>
      `;

      card.addEventListener("click", () => {
        if (!v.route || v.route.length < 3) {
          pushNotification(`⚠️ ${v.name} has no route set yet`);
          return;
        }

        if (routeLine) map.removeLayer(routeLine);

        // ✅ FIX: route points are {lat, lng} objects from MongoDB
        // Convert to [lat, lng] arrays for Leaflet
        const coords = v.route.map(p => [
          parseFloat(p.lat),
          parseFloat(p.lng)
        ]);

        routeLine = L.polyline(coords, {
          color: "#3ddc6e",
          weight: 4,
          opacity: 0.8
        }).addTo(map);

        map.fitBounds(routeLine.getBounds());

        // Store as [lat, lng] arrays for moveVehicle()
        currentRoute = coords;
        progress = 0;
        marker.setLatLng(coords[0]);

        // Update route label
        const label = document.getElementById("routeLabel");
        if (label) label.textContent = `${v.name}: ${v.from} → ${v.to}`;

        pushNotification(`📍 Showing route for ${v.name}`);
      });

      card.querySelector(".delete-btn").addEventListener("click", e => {
        e.stopPropagation();
        deleteVehicle(v._id, v.name);
      });

      list.appendChild(card);
    });

  } catch (err) {
    console.error("FAILED TO LOAD VEHICLES:", err);
  }
}

// ---------------- DELETE ----------------
function deleteVehicle(id, name) {
  if (!confirm(`Delete vehicle "${name}"?`)) return;
  fetch(`${API}/vehicles/${id}`, { method: "DELETE" })
    .then(() => {
      loadVehicleList();
      // Clear route if deleted vehicle was being shown
      if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
        currentRoute = [];
        progress = 0;
      }
    });
}

// ---------------- CHART ----------------
let sensorChart;
const tempData = [];
const humData  = [];
const labels   = [];

function initChart() {
  const ctx = document.getElementById("sensorChart").getContext("2d");

  sensorChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Temp °C",
          data: tempData,
          borderColor: "#e84545",
          backgroundColor: "rgba(232,69,69,0.08)",
          tension: 0.4,
          fill: true,
          pointRadius: 3
        },
        {
          label: "Humidity %",
          data: humData,
          borderColor: "#5bc8f5",
          backgroundColor: "rgba(91,200,245,0.08)",
          tension: 0.4,
          fill: true,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#5a7a5f",
            font: { family: "Space Mono", size: 10 }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#5a7a5f", font: { family: "Space Mono", size: 9 } },
          grid:  { color: "#1e3022" }
        },
        y: {
          ticks: { color: "#5a7a5f", font: { family: "Space Mono", size: 9 } },
          grid:  { color: "#1e3022" }
        }
      }
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
function initMap() {
  map = L.map("map").setView([-1.2921, 36.8219], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  marker = L.marker([-1.2921, 36.8219]).addTo(map);
}

// ---------------- SMOOTH MOVEMENT ----------------
// currentRoute is array of [lat, lng] arrays — coords[i][0] = lat, coords[i][1] = lng
function moveVehicle() {
  if (!currentRoute.length) return;

  const steps = 900;
  progress++;

  let t = progress / steps;
  if (t >= 1) {
    progress = 0;
    t = 0;
  }

  const i  = Math.floor(t * (currentRoute.length - 1));
  const p1 = currentRoute[i];
  const p2 = currentRoute[i + 1] || p1;

  const frac = (t * currentRoute.length) % 1;

  // ✅ p1[0] = lat, p1[1] = lng — matches the [lat, lng] array format we set above
  const lat = p1[0] + (p2[0] - p1[0]) * frac;
  const lng = p1[1] + (p2[1] - p1[1]) * frac;

  marker.setLatLng([lat, lng]);
}

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  initMap();
  loadSummary();
  loadVehicleList();

  setInterval(loadSummary,   5000);
  setInterval(moveVehicle,   1000);
});