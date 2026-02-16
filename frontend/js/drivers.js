const API = "https://movers-system.onrender.com/api/drivers";
const list = document.getElementById("driverList");
const form = document.getElementById("driverForm");

async function loadDrivers() {
  const r = await fetch(API);
  const d = await r.json();
  list.innerHTML = "";
  d.forEach(x => {
    list.innerHTML += `
      <tr>
        <td>${x.name}</td>
        <td>${x.phoneNumber}</td>
        <td>${x.vehicleID || "—"}</td>
      </tr>`;
  });
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const data = {
    name: dname.value,
    phoneNumber: dphone.value,
    vehicleID: dvehicle.value
  };

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  form.reset();
  loadDrivers();
});

loadDrivers();
