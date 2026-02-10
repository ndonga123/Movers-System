const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  name: String,
  latitude: Number,
  longitude: Number,
  from: String,
  to: String,
  route: [
    {
      lat: Number,
      lng: Number
    }
  ]
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
