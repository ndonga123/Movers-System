const express               = require("express");
const router                = express.Router();
const Vehicle               = require("../models/Vehicle");
const { buildRoute }        = require("../utils/routeService");
const { auth, requireRole } = require("../auth");

// GET all vehicles — public
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add vehicle — admin and transporter only
router.post("/", auth, requireRole("admin", "transporter"), async (req, res) => {
  try {
    const { name, from, to } = req.body;
    if (!name || !from || !to) {
      return res.status(400).json({ error: "name, from and to are required" });
    }
    let fromCoords = {}, route = [];
    try {
      const result = await buildRoute(from, to);
      fromCoords   = result.fromCoords;
      route        = result.route;
    } catch (routeErr) {
      console.warn("Route generation failed, saving without route:", routeErr.message);
    }
    const vehicle = new Vehicle({
      name, from, to,
      latitude:  fromCoords.lat || 0,
      longitude: fromCoords.lng || 0,
      route
    });
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error("Add vehicle error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update vehicle — admin and transporter only
router.put("/:id", auth, requireRole("admin", "transporter"), async (req, res) => {
  try {
    const { from, to } = req.body;
    let extra = {};
    if (from && to) {
      try {
        const { fromCoords, route } = await buildRoute(from, to);
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

// DELETE vehicle — admin only
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;