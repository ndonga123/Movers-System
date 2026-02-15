const mongoose = require("mongoose");

const PointSchema = new mongoose.Schema({
  lat: Number,
  lng: Number
});

const VehicleSchema = new mongoose.Schema({
  name: String,
  latitude: Number,
  longitude: Number,
  from: String,
  to: String,
  route: [PointSchema]
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
