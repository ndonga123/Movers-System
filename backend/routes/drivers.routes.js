const router                = require("express").Router();
const Driver                = require("../models/Driver");
const { auth, requireRole } = require("../auth");

// GET all drivers — public
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add driver — admin and transporter only
router.post("/", auth, requireRole("admin", "transporter"), async (req, res) => {
  try {
    const d = new Driver(req.body);
    await d.save();
    res.json(d);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update driver — admin and transporter only
router.put("/:id", auth, requireRole("admin", "transporter"), async (req, res) => {
  try {
    const d = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(d);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE driver — admin only
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;