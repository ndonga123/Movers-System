const router = require("express").Router();
const Report = require("../models/Report");

router.post("/", async (req, res) => {
  const r = new Report(req.body);
  await r.save();
  res.json({ msg: "Report saved" });
});

router.get("/", async (req, res) => {
  res.json(await Report.find());
});

module.exports = router;
