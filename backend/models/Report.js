const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  vehicle: String,
  driver:  String,
  issue:   String,
  status:  { type: String, default: "Open" },
  date:    { type: Date,   default: Date.now }
});

module.exports = mongoose.model("Report", ReportSchema);