const router = require("express").Router();

router.get("/", (req, res) => {
  const lat = (-1.29 + Math.random() * 0.01).toFixed(5);
  const lng = (36.82 + Math.random() * 0.01).toFixed(5);

  res.json({
    gps: `${lat}, ${lng}`,
    temp: (24 + Math.random() * 6).toFixed(1),
    humidity: (55 + Math.random() * 20).toFixed(1)
  });
});

module.exports = router;
