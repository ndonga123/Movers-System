require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const http    = require("http");
const https   = require("https");
const path    = require("path");
const { Server } = require("socket.io");

const connectDB = require("./db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// API routes
app.use("/api/auth",       require("./routes/auth.routes.js"));
app.use("/api/summary",    require("./routes/summary.routes.js"));
app.use("/api/deliveries", require("./routes/delivery.routes.js"));
app.use("/api/vehicles",   require("./routes/vehicle.routes.js"));
app.use("/api/reports",    require("./routes/report.routes.js"));
app.use("/api/drivers",    require("./routes/drivers.routes.js"));
app.use("/api/sensors",    require("./routes/sensor.routes.js"));

// TEMP DEBUG — remove after ORS confirmed working
app.get("/api/test-ors", (req, res) => {
  const key = process.env.ORS_KEY;
  if (!key) return res.json({ error: "ORS_KEY is MISSING" });

  const payload = JSON.stringify({
    coordinates: [[36.6867562, -1.4303485], [40.7056153, 3.2285332]]
  });

  const options = {
    hostname: "api.openrouteservice.org",
    path:     "/v2/directions/driving-car/geojson",
    method:   "POST",
    headers:  {
      "Authorization":  "Bearer " + key,
      "Content-Type":   "application/json",
      "Content-Length": Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, (orsRes) => {
    let data = "";
    orsRes.on("data", chunk => data += chunk);
    orsRes.on("end", () => {
      res.json({ status: orsRes.statusCode, key_prefix: key.substring(0, 10) + "...", body: data.substring(0, 500) });
    });
  });
  req.on("error", err => res.json({ error: err.message }));
  req.write(payload);
  req.end();
});

// Socket server
const server = http.createServer(app);
new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 10000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
  console.log("ORS_KEY loaded:", !!process.env.ORS_KEY);
});