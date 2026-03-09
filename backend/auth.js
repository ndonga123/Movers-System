const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "iot_movers_secret";

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ msg: "No token — please log in" });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // ✅ id, role, name are directly on decoded
    next();
  } catch {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ msg: "Forbidden — insufficient permissions" });
  }
  next();
};

module.exports = { auth, requireRole };