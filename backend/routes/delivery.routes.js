const express  = require("express");
const router   = express.Router();
const Delivery = require("../models/Delivery");

// GET all deliveries
router.get("/", async (req, res) => {
  try {
    const data = await Delivery.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add delivery
router.post("/", async (req, res) => {
  try {
    const d = await Delivery.create(req.body);
    res.json(d);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update delivery
router.put("/:id", async (req, res) => {
  try {
    const d = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(d);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE delivery
router.delete("/:id", async (req, res) => {
  try {
    await Delivery.findByIdAndDelete(req.params.id);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;