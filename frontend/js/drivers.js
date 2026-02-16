const API = "https://movers-system.onrender.com/api/drivers";
const list = document.getElementById("driverList");

async function loadDrivers(){
  const r = await fetch(API);
  const d = await r.json();
  list.innerHTML="";
  d.forEach(x=>{
    list.innerHTML+=`<tr><td>${x.name}</td><td>${x.phoneNumber}</td><td>${x.vehicleID||"—"}</td></tr>`;
  });
}
loadDrivers();
