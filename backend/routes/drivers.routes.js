const router = require("express").Router();
const Driver = require("../models/Driver");

// GET all drivers
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add driver
router.post("/", async (req, res) => {
  try {
    const d = new Driver(req.body);
    await d.save();
    res.json(d);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update driver
router.put("/:id", async (req, res) => {
  try {
    const d = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(d);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE driver
router.delete("/:id", async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;