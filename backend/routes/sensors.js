const express = require("express");
const router = express.Router();
const pool = require("../db");

// Simulate sensor data
router.post("/simulate", async (req, res) => {
  const vehicle_id = 1; // demo vehicle

  const temperature = Math.floor(Math.random() * 10) + 20;
  const humidity = Math.floor(Math.random() * 40) + 40;
  const latitude = -1.286389;
  const longitude = 36.817223;

  try {
    await pool.query(
      `INSERT INTO sensor_data
       (vehicle_id, temperature, humidity, latitude, longitude)
       VALUES ($1,$2,$3,$4,$5)`,
      [vehicle_id, temperature, humidity, latitude, longitude]
    );

    res.json({
      temperature,
      humidity,
      latitude,
      longitude
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sensor data
router.get("/", async (req, res) => {
  const data = await pool.query(
    "SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 20"
  );
  res.json(data.rows);
});

module.exports = router;
