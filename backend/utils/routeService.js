/* ============================================
   routeService.js — Geocoding & Route Generation
   IoT Movers System
   ============================================ */

const https = require("https");

const ORS_KEY = process.env.ORS_KEY;

// ── HTTP helper ──
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "IoTMoversSystem/1.0" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

function httpPost(url, body, headers) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const urlObj  = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path:     urlObj.pathname,
      method:   "POST",
      headers:  { ...headers, "Content-Length": Buffer.byteLength(payload) }
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ── GEOCODE city name → { lat, lng } ──
async function geocodeCity(cityName) {
  const query = encodeURIComponent(cityName + ", Kenya");
  const url   = "https://nominatim.openstreetmap.org/search?q=" + query + "&format=json&limit=1";
  const data  = await httpGet(url);
  if (!data.length) throw new Error("City not found: " + cityName);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

// ── GET ROAD ROUTE via OpenRouteService ──
async function getRoute(fromCoords, toCoords) {
  if (!ORS_KEY) throw new Error("ORS_KEY not set in environment variables");

  const result = await httpPost(
    "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
    { coordinates: [[fromCoords.lng, fromCoords.lat], [toCoords.lng, toCoords.lat]] },
    { "Authorization": "Bearer " + ORS_KEY, "Content-Type": "application/json" }
  );

  if (result.status !== 200) {
    throw new Error("ORS failed (" + result.status + "): " + JSON.stringify(result.body));
  }

  return result.body.features[0].geometry.coordinates.map(p => ({ lat: p[1], lng: p[0] }));
}

// ── FULL PIPELINE ──
async function buildRoute(fromCity, toCity) {
  const [fromCoords, toCoords] = await Promise.all([
    geocodeCity(fromCity),
    geocodeCity(toCity)
  ]);
  const route = await getRoute(fromCoords, toCoords);
  return { fromCoords, toCoords, route };
}

module.exports = { geocodeCity, getRoute, buildRoute };