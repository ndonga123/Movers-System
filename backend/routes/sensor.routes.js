const router = require("express").Router();
const Sensor = require("../models/Sensor");

router.get("/", async (req, res) => {
  const data = await Sensor.find().sort({ timestamp: -1 }).limit(100);
  res.json(data);
});

router.post("/", async (req, res) => {
  const s = new Sensor(req.body);
  await s.save();
  res.json(s);
});

module.exports = router;
