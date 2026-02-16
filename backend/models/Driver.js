const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  vehicleID: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }
});

module.exports = mongoose.model("Driver", driverSchema);
