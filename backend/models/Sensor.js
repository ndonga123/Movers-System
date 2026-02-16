const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  latitude: Number,
  longitude: Number,
  vehicleID: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Sensor", sensorSchema);
