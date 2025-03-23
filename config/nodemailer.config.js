const nodemailer = require("nodemailer");

let mailOptions;

if (process.env.NODE_ENV !== "production") {
  mailOptions = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
} else {
  mailOptions = {
    host: "smtp.google.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
}

const transporter = nodemailer.createTransport(mailOptions);

module.exports = transporter;
