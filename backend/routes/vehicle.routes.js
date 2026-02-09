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
router.post("/", async (req, res) => {
  try {
    const v = new Vehicle(req.body);
    await v.save();
    res.json({ msg: "Vehicle added", vehicle: v });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
