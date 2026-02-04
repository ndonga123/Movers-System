console.log("DASHBOARD JS LOADED");

function loadSummary() {
  fetch("https://movers-system.onrender.com/api/summary")
    .then(res => res.json())
    .then(data => {
      console.log("LIVE DATA:", data);

      const gpsEl = document.getElementById("gps");
      const tempEl = document.getElementById("temp");
      const humEl = document.getElementById("hum");

      if (!gpsEl || !tempEl || !humEl) {
        console.error("DOM ELEMENTS NOT FOUND");
        return;
      }

      gpsEl.textContent = data.gps;
      tempEl.textContent = data.temp + " °C";
      humEl.textContent = data.humidity + " %";
    })
    .catch(err => console.error("FETCH ERROR:", err));
}

// load once
loadSummary();

// refresh every 5 seconds
setInterval(loadSummary, 5000);
