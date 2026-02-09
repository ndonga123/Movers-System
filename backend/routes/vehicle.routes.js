const express = require("express");
const router = express.Router();

// TEMP in-memory vehicle store
let vehicles = [];

// GET all vehicles
router.get("/", (req, res) => {
  res.json(vehicles);
});

// ADD a vehicle
router.post("/", (req, res) => {
  const vehicle = req.body;
  vehicles.push(vehicle);
  res.json({ message: "Vehicle added", data: vehicle });
});

module.exports = router;
