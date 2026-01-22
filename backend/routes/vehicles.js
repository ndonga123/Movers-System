const express = require("express");
const router = express.Router();
const pool = require("../db");

// Add vehicle
router.post("/add", async (req, res) => {
  const { vehicle_number, driver_name } = req.body;

  try {
    await pool.query(
      "INSERT INTO vehicles (vehicle_number, driver_name) VALUES ($1,$2)",
      [vehicle_number, driver_name]
    );
    res.json({ message: "Vehicle added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all vehicles
router.get("/", async (req, res) => {
  const vehicles = await pool.query("SELECT * FROM vehicles");
  res.json(vehicles.rows);
});

module.exports = router;
