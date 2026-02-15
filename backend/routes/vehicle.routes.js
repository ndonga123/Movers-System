const router = require("express").Router();
const Vehicle = require("../models/Vehicle");

// GET all vehicles
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD vehicle
const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const getRoute = require("../utils/route.service");

router.get("/", async (req, res) => {
  const vehicles = await Vehicle.find();
  res.json(vehicles);
});

router.post("/", async (req, res) => {
  try {
    const { name, latitude, longitude, from, to } = req.body;

    const route = await getRoute(
      { lat: latitude, lng: longitude },
      { lat: -0.3031, lng: 36.0800 } // Nakuru
    );

    const v = new Vehicle({
      name,
      from,
      to,
      latitude,
      longitude,
      route: route.map(p => ({ lat: p[1], lng: p[0] }))
    });

    await v.save();
    res.json(v);

  } catch (err) {
    console.error("Vehicle route error:", err);
    res.status(500).json({ error: "Route generation failed" });
  }
});

router.delete("/:id", async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

module.exports = router;
// UPDATE vehicle
router.put("/:id", async (req, res) => {
  try {
    const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(v);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE vehicle
router.delete("/:id", async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ msg: "deleted" });
});

router.put("/:id", async (req, res) => {
  const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(v);
});
