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
        li.textContent = `${v.name} (${v.lat}, ${v.lng})`;
        list.appendChild(li);
      });
    });
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const vehicle = {
    name: document.getElementById("name").value,
    lat: document.getElementById("lat").value,
    lng: document.getElementById("lng").value
  };

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vehicle)
  })
  .then(() => {
    form.reset();
    loadVehicles();
  });
});

loadVehicles();
