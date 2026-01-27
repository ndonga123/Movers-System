const mongoose = require("mongoose");

const DeliverySchema = new mongoose.Schema({
  vehicle:String,
  driver:String,
  status:String
});

module.exports = mongoose.model("Delivery", DeliverySchema);
