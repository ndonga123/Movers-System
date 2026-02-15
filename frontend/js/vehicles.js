const ORS_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjFhOTE4MTIwYTA5MTRhMTE4MDkxMTQyYzQzM2VmYjhjIiwiaCI6Im11cm11cjY0In0=";

const API = "https://movers-system.onrender.com/api/vehicles";

const list = document.getElementById("vehicleList");

const form = document.getElementById("addVehicleForm");
async function getRealRoute(startLat, startLng, endLat, endLng) {
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?start=${startLng},${startLat}&end=${endLng},${endLat}`;

  const res = await fetch(url, {
    headers: {
      "Authorization": ORS_KEY
    }
  });

  const data = await res.json();
  return data.features[0].geometry.coordinates.map(p => ({
    lat: p[1],
    lng: p[0]
  }));
}


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

form.addEventListener("submit", async e => {
  e.preventDefault();

  const name = nameInput.value;
  const startLat = Number(latInput.value);
  const startLng = Number(lngInput.value);

  // Nairobi → Nakuru for now
  const destLat = -0.3031;
  const destLng = 36.0800;

  const route = await getRealRoute(startLat, startLng, destLat, destLng);

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, startLat, startLng, route })
  });

  loadVehicles();
});
