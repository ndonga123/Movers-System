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

app.use("/api/auth", require("./routes/auth.routes.js"));
app.use("/api/summary", require("./routes/summary.routes.js"));
app.use("/api/deliveries", require("./routes/delivery.routes.js"));
app.use("/api/vehicles", require("./routes/vehicle.routes.js"));

const server = http.createServer(app);
new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log("Server running on port", PORT)
);
