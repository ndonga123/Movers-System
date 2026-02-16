const API="https://movers-system.onrender.com/api/reports";
const list=document.getElementById("reportList");
const form=document.getElementById("reportForm");

async function load(){
  const r=await fetch(API);
  const d=await r.json();
  list.innerHTML="";
  d.forEach(x=>{
    list.innerHTML+=`
      <tr>
        <td>${x.vehicle}</td>
        <td>${x.issue}</td>
        <td>${x.status}</td>
        <td>${new Date(x.date).toLocaleString()}</td>
      </tr>`;
  });
}

form.addEventListener("submit", async e=>{
  e.preventDefault();

  const data={
    vehicle:rvehicle.value,
    issue:rissue.value,
    status:rstatus.value
  };

  await fetch(API,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(data)
  });

  form.reset();
  load();
});

load();
