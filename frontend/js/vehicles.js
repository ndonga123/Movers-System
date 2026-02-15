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
  const lat = Number(document.getElementById("lat").value);
  const lng = Number(document.getElementById("lng").value);
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;


    let route = [];

if (from.toLowerCase() === "nairobi" && to.toLowerCase() === "nakuru") {
  route = [ /* nakuru coords */ ];
}
else if (from.toLowerCase() === "nairobi" && to.toLowerCase() === "mombasa") {
  route = [ /* mombasa coords */ ];
}



  const vehicle = {
    name,
    lat,
    lng,
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
