require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const connectDB = require("./db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// 🔹 Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// 🔹 API routes
app.use("/api/auth", require("./routes/auth.routes.js"));
app.use("/api/summary", require("./routes/summary.routes.js"));
app.use("/api/deliveries", require("./routes/delivery.routes.js"));
app.use("/api/vehicles", require("./routes/vehicle.routes.js"));

// 🔹 Socket server
const server = http.createServer(app);
new Server(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
