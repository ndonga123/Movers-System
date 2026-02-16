const API="https://movers-system.onrender.com/api/reports";
const list=document.getElementById("reportList");

async function load(){
  const r=await fetch(API);
  const d=await r.json();
  list.innerHTML="";
  d.forEach(x=>{
    list.innerHTML+=`<tr><td>${x.vehicle}</td><td>${x.issue}</td><td>${x.status}</td><td>${new Date(x.date).toLocaleDateString()}</td></tr>`;
  });
}
load();
