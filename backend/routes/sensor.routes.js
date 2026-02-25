const router = require("express").Router();
const Sensor = require("../models/Sensor");

// GET latest sensor readings
router.get("/", async (req, res) => {
  try {
    const data = await Sensor.find().sort({ timestamp: -1 }).limit(100);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new sensor reading
router.post("/", async (req, res) => {
  try {
    const s = new Sensor(req.body);
    await s.save();
    res.json(s);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE sensor reading
router.delete("/:id", async (req, res) => {
  try {
    await Sensor.findByIdAndDelete(req.params.id);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;