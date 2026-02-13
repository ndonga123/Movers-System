const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_PASS
  }
});

async function sendAlert(to, subject, message) {
  await transporter.sendMail({
    from: `"IoT Movers" <${process.env.ALERT_EMAIL}>`,
    to,
    subject,
    html: `<h3>${subject}</h3><p>${message}</p>`
  });
}

module.exports = sendAlert;
