const router = require("express").Router();
const Report = require("../models/Report");
const { auth, requireRole } = require("../middleware/auth");

// GET all reports — public
router.get("/", async (req, res) => {
  try {
    res.json(await Report.find().sort({ date: -1 }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add report — all authenticated users
router.post("/", auth, async (req, res) => {
  try {
    const r = new Report({
      ...req.body,
      createdBy:   req.user.id,
      createdRole: req.user.role
    });
    await r.save();
    res.json(r);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT resolve report
// - Admin/Transporter: can resolve any report
// - Driver: can only resolve their own reports
router.put("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const role = req.user.role;
    const isOwner = report.createdBy && report.createdBy.toString() === req.user.id;

    if (role === "farmer") {
      return res.status(403).json({ error: "Farmers cannot resolve reports" });
    }
    if (role === "driver" && !isOwner) {
      return res.status(403).json({ error: "Drivers can only resolve their own reports" });
    }

    const updated = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE report — admin and transporter only
router.delete("/:id", auth, requireRole("admin", "transporter"), async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;