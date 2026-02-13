const router = require("express").Router();

// Fake route across Nairobi (smooth movement)
const route = [
  [-1.2921, 36.8219],
  [-1.2915, 36.8232],
  [-1.2908, 36.8250],
  [-1.2899, 36.8265],
  [-1.2888, 36.8282],
  [-1.2876, 36.8300],
  [-1.2865, 36.8321],
  [-1.2854, 36.8343],
];

let index = 0;

// Random sensor base
let temp = 26;
let humidity = 60;

router.get("/", (req, res) => {
  // Move forward on route
  const [lat, lng] = route[index];
  index = (index + 1) % route.length;

  // Smooth random change
  temp += (Math.random() - 0.5);
  humidity += (Math.random() - 0.5) * 2;

  res.json({
    gps: `${lat.toFixed(5)},${lng.toFixed(5)}`,
    temp: temp.toFixed(1),
    humidity: humidity.toFixed(1)
  });
});

module.exports = router;
const sendAlert = require("../utils/mailer");
if (data.temp > 30) {
  await sendAlert(
    "manager@email.com",
    "🔥 Temperature Alert",
    `Vehicle temperature is ${data.temp}°C`
  );
}

if (data.humidity > 80) {
  await sendAlert(
    "manager@email.com",
    "💧 Humidity Alert",
    `Humidity is ${data.humidity}%`
  );
}
