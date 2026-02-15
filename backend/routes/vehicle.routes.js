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
