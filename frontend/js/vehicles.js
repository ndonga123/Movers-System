const API = "https://movers-system.onrender.com/api/vehicles";

const list = document.getElementById("vehicleList");
const form = document.getElementById("addVehicleForm");

function loadVehicles() {
  fetch(API)
    .then(res => res.json())
    .then(data => {
      list.innerHTML = "";
      data.forEach(v => {
        const li = document.createElement("li");
        li.textContent = `${v.name} | ${v.from} → ${v.to}`;
        list.appendChild(li);
      });
    });
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const latitude = document.getElementById("lat").value;
  const longitude = document.getElementById("lng").value;
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;

  const route = [
    { lat: -1.2921, lng: 36.8219 }, // Nairobi
    { lat: -1.1500, lng: 36.8000 },
    { lat: -0.9500, lng: 36.8500 },
    { lat: -0.7000, lng: 36.7000 },
    { lat: -0.3031, lng: 36.0800 }  // Nakuru
  ];

  const vehicle = {
    name,
    latitude: Number(latitude),
    longitude: Number(longitude),
    from,
    to,
    route
  };

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vehicle)
  }).then(() => {
    form.reset();
    loadVehicles();
  });
});

loadVehicles();
