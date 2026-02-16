const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  message: String,
  vehicleID: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);
