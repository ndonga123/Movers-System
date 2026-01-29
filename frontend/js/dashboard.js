setInterval(() => {
  const lat = (-1.2997 + Math.random() * 0.01).toFixed(5);
  const lng = (36.8219 + Math.random() * 0.01).toFixed(5);

  document.getElementById("gps").innerText = `${lat}, ${lng}`;
  document.getElementById("temp").innerText = (20 + Math.random() * 10).toFixed(1) + "°C";
  document.getElementById("hum").innerText = (50 + Math.random() * 20).toFixed(1) + "%";
}, 2000);
// Initial position (Nairobi)
let lat = -1.2997;
let lng = 36.8219;

// Create map
const map = L.map("map").setView([lat, lng], 13);

// Load real OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Add marker
const marker = L.marker([lat, lng]).addTo(map)
  .bindPopup("Vehicle 1")
  .openPopup();

// Simulate real GPS movement
setInterval(() => {
  lat += (Math.random() - 0.5) * 0.001;
  lng += (Math.random() - 0.5) * 0.001;

  marker.setLatLng([lat, lng]);
  map.setView([lat, lng]);

  document.getElementById("gps").innerText =
    lat.toFixed(5) + ", " + lng.toFixed(5);
}, 3000);
