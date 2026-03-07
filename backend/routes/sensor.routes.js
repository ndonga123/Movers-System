const router = require("express").Router();
const Sensor = require("../models/Sensor");

// ── EMA DATA FILTER (server-side before saving to DB) ──
// Alpha: 0.3 = smooth, reduces noise from DHT11 sensor
const ALPHA = 0.3;
let lastTemp  = null;
let lastHumid = null;

function emaFilter(newTemp, newHumid) {
  if (lastTemp === null) {
    lastTemp  = newTemp;
    lastHumid = newHumid;
  } else {
    lastTemp  = ALPHA * newTemp  + (1 - ALPHA) * lastTemp;
    lastHumid = ALPHA * newHumid + (1 - ALPHA) * lastHumid;
  }
  return {
    temperature: parseFloat(lastTemp.toFixed(2)),
    humidity:    parseFloat(lastHumid.toFixed(2))
  };
}

// GET latest sensor readings
router.get("/", async (req, res) => {
  try {
    const data = await Sensor.find().sort({ timestamp: -1 }).limit(100);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new sensor reading — applies EMA filter before saving
router.post("/", async (req, res) => {
  try {
    const { temperature, humidity, latitude, longitude, vehicleID } = req.body;

    if (temperature === undefined || humidity === undefined) {
      return res.status(400).json({ error: "temperature and humidity are required" });
    }

    // Apply noise filter
    const filtered = emaFilter(Number(temperature), Number(humidity));

    const s = new Sensor({
      temperature: filtered.temperature,
      humidity:    filtered.humidity,
      latitude:    latitude  || null,
      longitude:   longitude || null,
      vehicleID:   vehicleID || null
    });

    await s.save();
    res.json({
      ...s.toObject(),
      raw: { temperature, humidity } // return raw too for debugging
    });

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