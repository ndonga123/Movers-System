const express = require("express");
const router  = express.Router();
const Vehicle = require("../models/Vehicle");

// ── GEOCODE city name → coords using Nominatim (free, no key needed) ──
async function geocodeCity(cityName) {
  const query = encodeURIComponent(`${cityName}, Kenya`);
  const url   = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
  const res   = await fetch(url, { headers: { "User-Agent": "IoTMoversSystem/1.0" } });
  const data  = await res.json();
  if (!data.length) throw new Error(`City not found: ${cityName}`);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

// ── GET ROAD ROUTE via ORS — key from .env ──
async function getRoute(fromCoords, toCoords) {
  const key = process.env.ORS_KEY;
  if (!key) throw new Error("ORS_KEY not set in .env");

  const url = `https://api.openrouteservice.org/v2/directions/driving-car?start=${fromCoords.lng},${fromCoords.lat}&end=${toCoords.lng},${toCoords.lat}`;
  const res = await fetch(url, { headers: { "Authorization": key } });
  if (!res.ok) throw new Error("ORS failed: " + res.status);

  const data = await res.json();
  return data.features[0].geometry.coordinates.map(p => ({ lat: p[1], lng: p[0] }));
}

// ── GET all vehicles ──
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST add vehicle ──
// Receives: name, from, to (city names only)
router.post("/", async (req, res) => {
  try {
    const { name, from, to } = req.body;

    if (!name || !from || !to) {
      return res.status(400).json({ error: "name, from and to are required" });
    }

    const [fromCoords, toCoords] = await Promise.all([
      geocodeCity(from),
      geocodeCity(to)
    ]);

    let route = [];
    try {
      route = await getRoute(fromCoords, toCoords);
    } catch (routeErr) {
      console.warn("Route generation failed, saving without route:", routeErr.message);
    }

    const vehicle = new Vehicle({
      name,
      from,
      to,
      latitude:  fromCoords.lat,
      longitude: fromCoords.lng,
      route
    });

    await vehicle.save();
    res.json(vehicle);

  } catch (err) {
    console.error("Add vehicle error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── PUT update vehicle ──
router.put("/:id", async (req, res) => {
  try {
    const { from, to } = req.body;
    let extra = {};

    if (from && to) {
      try {
        const [fromCoords, toCoords] = await Promise.all([
          geocodeCity(from),
          geocodeCity(to)
        ]);
        const route = await getRoute(fromCoords, toCoords);
        extra = { latitude: fromCoords.lat, longitude: fromCoords.lng, route };
      } catch (err) {
        console.warn("Re-routing failed on edit:", err.message);
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...extra },
      { new: true }
    );
    res.json(vehicle);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE vehicle ──
router.delete("/:id", async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;