/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import nodemailer from 'nodemailer';

// -------------------- CONFIGURE TRANSPORT --------------------
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || "your@email.com",
    pass: process.env.EMAIL_PASS || "yourpassword",
  },
});

// Verify transporter configuration
transporter.verify((err, success) => {
  if (err) {
    console.error("Error connecting to email server:", err);
  } else {
    console.log("Email server is ready to take messages");
  }
});

// -------------------- SEND EMAIL FUNCTION --------------------
/**
 * sendEmail
 * @param {Object} options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - email subject
 * @param {string} options.text - plain text body
 * @param {string} [options.html] - optional HTML body
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Salon App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw new Error("Failed to send email");
  }
};
