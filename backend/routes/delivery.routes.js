const express               = require("express");
const router                = express.Router();
const Delivery              = require("../models/Delivery");
const { auth, requireRole } = require("../auth");

// GET all deliveries — public
router.get("/", async (req, res) => {
  try {
    res.json(await Delivery.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add delivery — admin and transporter only
router.post("/", auth, requireRole("admin", "transporter"), async (req, res) => {
  try {
    const d = await Delivery.create(req.body);
    res.json(d);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update delivery — admin and transporter only
router.put("/:id", auth, requireRole("admin", "transporter"), async (req, res) => {
  try {
    const d = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(d);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE delivery — admin only
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    await Delivery.findByIdAndDelete(req.params.id);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;