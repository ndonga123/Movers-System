const router = require("express").Router();
const Driver = require("../models/Driver");

router.get("/", async (req, res) => {
  const drivers = await Driver.find().populate("vehicleID");
  res.json(drivers);
});

router.post("/", async (req, res) => {
  const d = new Driver(req.body);
  await d.save();
  res.json(d);
});

module.exports = router;
