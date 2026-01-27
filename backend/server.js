require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./db");
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/summary", require("./routes/summary.routes"));
app.use("/api/deliveries", require("./routes/delivery.routes"));
app.use("/api/vehicle", require("./routes/Vehicle.route")); // 👈 matches your filename

const server = http.createServer(app);
new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log("Backend running on http://localhost:" + PORT)
);
