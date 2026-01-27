const express = require("express");
const auth = require("../auth");
const router = express.Router();

router.get("/", auth, (req,res)=>{
  res.json({
    gps:{lat:-1.2997,lng:36.8219},
    activeDeliveries:3,
    temperature:25,
    humidity:62
  });
});

module.exports = router;
