const router = require("express").Router();
const sendAlert = require("../utils/mailer");

// Fake route
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
let temp = 26;
let humidity = 60;

router.get("/", async (req, res) => {
  const [lat, lng] = route[index];
  index = (index + 1) % route.length;

  temp += (Math.random() - 0.5);
  humidity += (Math.random() - 0.5) * 2;

  const data = {
    gps: `${lat.toFixed(5)},${lng.toFixed(5)}`,
    temp: temp.toFixed(1),
    humidity: humidity.toFixed(1),
  };

  const sendAlert = require("../utils/mailer");

if (temp > 30) {
  await sendAlert("your@email.com", "🔥 Temp Alert", `Temp: ${temp}`);
}


  if (data.humidity > 80) {
    await sendAlert(
      "your@email.com",
      "💧 Humidity Alert",
      `Humidity is ${data.humidity}%`
    );
  }

  res.json(data);
});

module.exports = router;
