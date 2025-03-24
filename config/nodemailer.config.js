const nodemailer = require("nodemailer");
const { promisify } = require('util')

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
    connectionTimeout: 10000, // timeout after 10 seconds
    socketTimeout: 20000, // timeout after 20 seconds
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
    connectionTimeout: 10000, // timeout after 10 seconds
    socketTimeout: 20000 // timeout after 20 seconds
  };
}

const transporter = nodemailer.createTransport(mailOptions);

module.exports = promisify(transporter.sendMail.bind(transporter));
