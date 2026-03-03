/* ============================================
   routeService.js — Geocoding & Route Generation
   IoT Movers System
   ============================================ */

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const ORS_KEY = process.env.ORS_KEY;

// ── GEOCODE city name → { lat, lng } using Nominatim ──
async function geocodeCity(cityName) {
  const query = encodeURIComponent(cityName + ", Kenya");
  const url   = "https://nominatim.openstreetmap.org/search?q=" + query + "&format=json&limit=1";

  const res  = await fetch(url, {
    headers: { "User-Agent": "IoTMoversSystem/1.0 (peter@movers.co.ke)" }
  });
  const data = await res.json();

  if (!data.length) throw new Error("City not found: " + cityName);

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}

// ── GET ROAD ROUTE via OpenRouteService ──
// Returns array of { lat, lng } points along the road
async function getRoute(fromCoords, toCoords) {
  if (!ORS_KEY) throw new Error("ORS_KEY not set in environment variables");

  const url  = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
  const body = {
    coordinates: [
      [fromCoords.lng, fromCoords.lat],
      [toCoords.lng,   toCoords.lat]
    ]
  };

  const res = await fetch(url, {
    method:  "POST",
    headers: {
      "Authorization": ORS_KEY,
      "Content-Type":  "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("ORS failed (" + res.status + "): " + err);
  }

  const data = await res.json();

  // Convert [lng, lat] arrays from ORS → { lat, lng } objects for MongoDB
  return data.features[0].geometry.coordinates.map(p => ({
    lat: p[1],
    lng: p[0]
  }));
}

// ── FULL PIPELINE: city names → route points ──
// Usage: const route = await buildRoute("Nairobi", "Nakuru")
async function buildRoute(fromCity, toCity) {
  const [fromCoords, toCoords] = await Promise.all([
    geocodeCity(fromCity),
    geocodeCity(toCity)
  ]);

  const route = await getRoute(fromCoords, toCoords);

  return {
    fromCoords,
    toCoords,
    route
  };
}

module.exports = { geocodeCity, getRoute, buildRoute };