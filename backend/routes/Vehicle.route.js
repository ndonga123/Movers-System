const express = require("express");
const auth = require("../auth");
const Vehicle = require("../Vehicle"); 

const router = express.Router();

/* Get all vehicles */
router.get("/", auth, async (req, res) => {
  const vehicles = await Vehicle.find();
  res.json(vehicles);
});

/* Add new vehicle */
router.post("/", auth, async (req, res) => {
  const v = await Vehicle.create(req.body);
  res.json(v);
});

/* Update GPS + sensors */
router.put("/:id/telemetry", async (req, res) => {
  const v = await Vehicle.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true }
  );
  res.json(v);
});

module.exports = router;
