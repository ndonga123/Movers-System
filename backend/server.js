const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");
const sensorRoutes = require("./routes/sensors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("IoT Movers Transport System API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/sensors", sensorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
