const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const sendEmail = async ({ to, subject, html }) => {
  // If Resend API Key is set, try using Resend first
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Resend free tier allows sending to your own verified account email via onboarding@resend.dev.
      // Once you link a custom domain (e.g., yourdomain.com), you can send to anyone in the world.
      const result = await resend.emails.send({
        from: 'KeeBo Support <onboarding@resend.dev>',
        to,
        subject,
        html,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log(`Email successfully sent via Resend to ${to}`);
      return;
    } catch (err) {
      console.warn(`Resend dispatch failed (${err.message}). Falling back to Gmail SMTP...`);
    }
  }

  // Fallback Transporter (Nodemailer + Gmail App Password)
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
  console.log(`Email successfully sent via Gmail SMTP fallback to ${to}`);
};

module.exports = sendEmail;


