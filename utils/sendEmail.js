const nodemailer = require('nodemailer');

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


