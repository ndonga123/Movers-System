const router    = require("express").Router();
const sendAlert = require("../utils/mailer");

// Smooth demo GPS route (Nairobi CBD loop)
const route = [
  [-1.2921, 36.8219],
  [-1.2915, 36.8232],
  [-1.2908, 36.8250],
  [-1.2899, 36.8265],
  [-1.2888, 36.8282],
  [-1.2876, 36.8300],
  [-1.2865, 36.8321],
  [-1.2854, 36.8343]
];

let index    = 0;
let temp     = 26;
let humidity = 60;

router.get("/", async (req, res) => {
  try {
    // Move along GPS route
    const [lat, lng] = route[index];
    index = (index + 1) % route.length;

    // Smooth random sensor change
    temp     += (Math.random() - 0.5);
    humidity += (Math.random() - 0.5) * 2;

    // Email alerts for threshold breaches
    if (temp > 30) {
      try {
        await sendAlert(
          "manager@email.com",
          "🔥 Temperature Alert",
          `Vehicle temperature is ${temp.toFixed(1)}°C — cargo at risk!`
        );
      } catch (mailErr) {
        console.warn("Email alert failed:", mailErr.message);
      }
    }

    if (humidity > 80) {
      try {
        await sendAlert(
          "manager@email.com",
          "💧 Humidity Alert",
          `Vehicle humidity is ${humidity.toFixed(1)}% — spoilage risk!`
        );
      } catch (mailErr) {
        console.warn("Email alert failed:", mailErr.message);
      }
    }

    res.json({
      gps:      `${lat.toFixed(5)},${lng.toFixed(5)}`,
      temp:     temp.toFixed(1),
      humidity: humidity.toFixed(1)
    });

  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ error: "Summary failed" });
  }
});

module.exports = router;