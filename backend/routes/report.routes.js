const router = require("express").Router();
const Report = require("../models/Report");

// GET all reports
router.get("/", async (req, res) => {
  try {
    res.json(await Report.find());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add report
router.post("/", async (req, res) => {
  try {
    const r = new Report(req.body);
    await r.save();
    res.json(r);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update report
router.put("/:id", async (req, res) => {
  try {
    const r = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(r);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE report
router.delete("/:id", async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;