setInterval(() => {
  const lat = (-1.2997 + Math.random() * 0.01).toFixed(5);
  const lng = (36.8219 + Math.random() * 0.01).toFixed(5);

  document.getElementById("gps").innerText = `${lat}, ${lng}`;
  document.getElementById("temp").innerText = (20 + Math.random() * 10).toFixed(1) + "°C";
  document.getElementById("hum").innerText = (50 + Math.random() * 20).toFixed(1) + "%";
}, 2000);
