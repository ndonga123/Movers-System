const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  vehicle:     { type: String },
  driver:      { type: String },
  issue:       { type: String, required: true },
  status:      { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
  date:        { type: Date, default: Date.now },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdRole: { type: String }
});

module.exports = mongoose.model("Report", ReportSchema);