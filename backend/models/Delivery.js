const mongoose = require("mongoose");

const DeliverySchema = new mongoose.Schema({
  vehicle:   String,
  driver:    String,
  from:      String,
  to:        String,
  status:    { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Delivery", DeliverySchema);