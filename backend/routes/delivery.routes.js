const express = require("express");
const Delivery = require("../Delivery"); // ✅ correct path

const router = express.Router();

/* Get all deliveries */
router.get("/", async (req, res) => {
  const data = await Delivery.find();
  res.json(data);
});

/* Add new delivery */
router.post("/", async (req, res) => {
  const d = await Delivery.create(req.body);
  res.json(d);
});

module.exports = router;
