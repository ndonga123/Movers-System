require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const http    = require("http");
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

// TEMP DEBUG — remove after ORS is confirmed working
app.get("/api/test-ors", async (req, res) => {
  try {
    const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
    const key = process.env.ORS_KEY;
    if (!key) return res.json({ error: "ORS_KEY is MISSING from environment" });

    const result = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ coordinates: [[36.6867562, -1.4303485], [40.7056153, 3.2285332]] })
    });

    const text = await result.text();
    res.json({ status: result.status, key_prefix: key.substring(0, 10) + "...", body: text.substring(0, 500) });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Socket server
const server = http.createServer(app);
new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 10000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
  console.log("ORS_KEY loaded:", !!process.env.ORS_KEY);
});