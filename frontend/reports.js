const API = "https://movers-system.onrender.com/api/reports";

document.getElementById("reportForm").addEventListener("submit", async e => {
  e.preventDefault();

  const data = {
    vehicle: document.getElementById("vehicle").value,
    issue: document.getElementById("issue").value,
    date: new Date()
  };

  await fetch(API, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(data)
  });

  alert("Report sent");
});
