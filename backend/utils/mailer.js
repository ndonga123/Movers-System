/* ============================================
   mailer.js — Email Alert System
   IoT Movers System
   ============================================ */

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_PASS
  }
});

// ── SEND GENERIC ALERT ──
async function sendAlert(to, subject, text) {
  try {
    await transporter.sendMail({
      from:    `"IoT Movers 🌿" <${process.env.ALERT_EMAIL}>`,
      to,
      subject,
      html: `
        <div style="font-family:sans-serif; max-width:500px; margin:auto; 
             background:#0a1a0d; color:#c8e6c9; padding:24px; border-radius:12px;">
          <h2 style="color:#3ddc6e; margin-bottom:8px;">🚨 IoT Movers Alert</h2>
          <p style="font-size:15px; line-height:1.6;">${text}</p>
          <hr style="border-color:#1e3022; margin:16px 0"/>
          <small style="color:#5a7a5f;">IoT Movers System · Kenya Agri-Logistics</small>
        </div>`
    });
    console.log("Alert sent to:", to);
  } catch (err) {
    console.error("Mailer error:", err.message);
  }
}

// ── TEMPERATURE ALERT ──
async function sendTempAlert(temp, vehicleName) {
  const manager = process.env.MANAGER_EMAIL || process.env.ALERT_EMAIL;
  await sendAlert(
    manager,
    "🔥 Temperature Alert — " + vehicleName,
    "Vehicle <strong>" + vehicleName + "</strong> has exceeded safe temperature limits.<br/><br/>" +
    "Current temperature: <strong style='color:#e84545'>" + temp + "°C</strong><br/>" +
    "Threshold: 30°C<br/><br/>" +
    "Please check cargo condition immediately."
  );
}

// ── HUMIDITY ALERT ──
async function sendHumidityAlert(humidity, vehicleName) {
  const manager = process.env.MANAGER_EMAIL || process.env.ALERT_EMAIL;
  await sendAlert(
    manager,
    "💧 Humidity Alert — " + vehicleName,
    "Vehicle <strong>" + vehicleName + "</strong> has exceeded safe humidity limits.<br/><br/>" +
    "Current humidity: <strong style='color:#5bc8f5'>" + humidity + "%</strong><br/>" +
    "Threshold: 80%<br/><br/>" +
    "Risk of spoilage — please take action."
  );
}

// ── DELIVERY STATUS ALERT ──
async function sendDeliveryAlert(to, vehicleName, status, route) {
  await sendAlert(
    to,
    "📦 Delivery Update — " + vehicleName,
    "Your delivery via <strong>" + vehicleName + "</strong> has been updated.<br/><br/>" +
    "Route: <strong>" + route + "</strong><br/>" +
    "Status: <strong style='color:#3ddc6e'>" + status + "</strong>"
  );
}

module.exports = { sendAlert, sendTempAlert, sendHumidityAlert, sendDeliveryAlert };