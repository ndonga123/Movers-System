const API="https://movers-system.onrender.com/api/summary";
const table=document.getElementById("sensorTable");

setInterval(async()=>{
  const r=await fetch(API);
  const d=await r.json();
  table.innerHTML+=`<tr>
<td>Main</td><td>${d.temp}</td><td>${d.humidity}</td><td>${d.gps}</td><td>${new Date().toLocaleTimeString()}</td>
</tr>`;
},5000);
