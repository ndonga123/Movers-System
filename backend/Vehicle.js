const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  plate: { type: String, required: true, unique: true },
  driver: String,
  status: { type: String, default: "Idle" },
  gps: {
    lat: Number,
    lng: Number
  },
  temperature: Number,
  humidity: Number,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vehicles", VehicleSchema);
