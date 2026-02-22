const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name:        String,
  phoneNumber:  String,
  vehicleID:   String   // plain string e.g. "KDW 200 A" — not an ObjectId reference
});

module.exports = mongoose.model("Driver", driverSchema);