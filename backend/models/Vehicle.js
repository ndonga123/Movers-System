const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  name: String,
  from: String,
  to: String,
  latitude: Number,
  longitude: Number,
  status: { type: String, default: "Moving" },
  driverID: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  route: [{ lat: Number, lng: Number }]
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
