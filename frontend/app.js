const socket = io("http://localhost:5000");
let map, marker;

socket.on("update", d => {
  gps.textContent = `${d.gps.lat.toFixed(4)}, ${d.gps.lng.toFixed(4)}`;
  temp.textContent = d.temperature;
  hum.textContent = d.humidity;
  temp2.textContent = d.temperature;
  hum2.textContent = d.humidity;

  if(!map){
    map = new google.maps.Map(mapDiv = document.getElementById("map"), {
      zoom: 13,
      center: d.gps
    });
    marker = new google.maps.Marker({ position:d.gps, map });
  }
  marker.setPosition(d.gps);
  map.setCenter(d.gps);
});

fetch("http://localhost:5000/api/deliveries")
.then(r=>r.json())
.then(rows=>{
  table.innerHTML = rows.map(r =>
    `<tr><td>${r.id}</td><td>${r.driver}</td><td>${r.status}</td></tr>`
  ).join("");
});
