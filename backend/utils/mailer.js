const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_PASS
  }
});

module.exports = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"IoT Movers" <${process.env.ALERT_EMAIL}>`,
    to,
    subject,
    text
  });
};
