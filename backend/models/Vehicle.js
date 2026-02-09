const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  name: String,
  from: String,
  to: String,
  lat: String,
  lng: String
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
