console.log("DASHBOARD JS LOADED");

fetch("https://movers-system.onrender.com/api/summary")
  .then(res => res.json())
  .then(data => {
    console.log("LIVE DATA:", data);

    document.getElementById("gps").textContent = data.gps;
    document.getElementById("temp").textContent = data.temp + " °C";
    document.getElementById("hum").textContent = data.humidity + " %";
  })
  .catch(err => console.error("FETCH ERROR:", err));
