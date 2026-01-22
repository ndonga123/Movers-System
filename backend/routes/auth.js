const express = require("express");
const router = express.Router();
const pool = require("../db");

// Register user
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    await pool.query(
      "INSERT INTO users (username, password) VALUES ($1,$2)",
      [username, password]
    );
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE username=$1 AND password=$2",
    [username, password]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", user: result.rows[0] });
});

module.exports = router;
