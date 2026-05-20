const nodemailer = require('nodemailer');
const axios = require('axios');

// Helper to strip HTML tags to generate a clean plain-text alternative
const stripHtml = (htmlMarkup) => {
  if (!htmlMarkup) return '';
  return htmlMarkup
    .replace(/<style([\s\S]*?)<\/style>/gi, '') // Remove CSS blocks
    .replace(/<[^>]+>/g, ' ')                  // Strip HTML tags
    .replace(/\s+/g, ' ')                     // Normalize whitespaces
    .trim();
};

const sendEmail = async ({ to, subject, html, text }) => {
  const plainText = text || (html ? stripHtml(html) : '');
  const preferTextOnly = process.env.EMAIL_PREFER_TEXT === 'true';

  // If Brevo API Key is set, send via Brevo HTTP API (perfect for Render, HTTP-based)
  if (process.env.BREVO_API_KEY) {
    try {
      const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'keebo.platform@gmail.com';
      const senderName = process.env.BREVO_SENDER_NAME || 'KeeBo Support';

      // Log a warning if sending from a Gmail address via Brevo (major SPF/DMARC spam trigger)
      if (senderEmail.endsWith('@gmail.com')) {
        console.warn(`[WARNING] Sending via Brevo using a @gmail.com address (${senderEmail}). This will likely fail SPF/DMARC checks and land in spam. Please set BREVO_SENDER_EMAIL to a verified domain email.`);
      }

      const payload = {
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [{ email: to }],
        subject: subject,
      };

      if (preferTextOnly) {
        payload.textContent = plainText;
      } else {
        if (html) payload.htmlContent = html;
        if (plainText) payload.textContent = plainText;
      }

      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        payload,
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

  const mailOptions = {
    from: `"KeeBo Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
  };

  if (preferTextOnly) {
    mailOptions.text = plainText;
  } else {
    if (plainText) mailOptions.text = plainText;
    if (html) mailOptions.html = html;
  }

  await transporter.sendMail(mailOptions);
  console.log(`Email successfully sent via Gmail SMTP to ${to}`);
};

module.exports = sendEmail;


