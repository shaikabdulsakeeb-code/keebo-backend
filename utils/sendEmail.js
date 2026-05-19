const nodemailer = require('nodemailer');
const axios = require('axios');

const sendEmail = async ({ to, subject, html }) => {
  // If Brevo API Key is set, send via Brevo HTTP API (perfect for Render, HTTP-based)
  if (process.env.BREVO_API_KEY) {
    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: 'KeeBo Support',
            email: process.env.EMAIL_USER || 'keebo.platform@gmail.com',
          },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html,
        },
        {
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      console.log(`Email successfully sent via Brevo HTTP API to ${to}`);
      return;
    } catch (err) {
      const errMsg = err.response && err.response.data && err.response.data.message 
        ? err.response.data.message 
        : err.message;
      console.warn(`Brevo HTTP dispatch failed (${errMsg}). Falling back to Gmail SMTP...`);
    }
  }

  // Transporter (Nodemailer + Gmail App Password)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password (not regular password)
    },
    connectionTimeout: 8000, // 8 seconds timeout for TCP connection
    greetingTimeout: 8000,   // 8 seconds timeout for SMTP greeting
    socketTimeout: 8000,     // 8 seconds timeout for data transmission
  });

  // Helper to strip HTML tags to generate a clean plain-text alternative
  const stripHtml = (htmlMarkup) => {
    return htmlMarkup
      .replace(/<style([\s\S]*?)<\/style>/gi, '') // Remove CSS blocks
      .replace(/<[^>]+>/g, ' ')                  // Strip HTML tags
      .replace(/\s+/g, ' ')                     // Normalize whitespaces
      .trim();
  };

  const mailOptions = {
    from: `"KeeBo Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: stripHtml(html), // Plain-text fallback for low spam-scoring
    html,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email successfully sent via Gmail SMTP to ${to}`);
};

module.exports = sendEmail;


