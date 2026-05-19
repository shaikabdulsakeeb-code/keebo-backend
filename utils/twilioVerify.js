const twilio = require('twilio');

/**
 * Send an SMS OTP verification code to a phone number using Twilio Verify.
 * @param {string} toPhoneNumber - The recipient's phone number (in E.164 format, e.g., +918247590678)
 * @returns {Promise<object>} Twilio response object
 */
const sendVerificationCode = async (toPhoneNumber) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    throw new Error('Twilio Verify credentials are not configured in your .env file.');
  }

  const client = twilio(accountSid, authToken);

  const verification = await client.verify.v2.services(serviceSid)
    .verifications
    .create({ to: toPhoneNumber, channel: 'sms' });

  return verification;
};

/**
 * Check if a code entered by the user is correct for the given phone number.
 * @param {string} toPhoneNumber - The recipient's phone number (in E.164 format)
 * @param {string} code - The 4-to-6 digit code entered by the user
 * @returns {Promise<boolean>} True if approved, false otherwise
 */
const checkVerificationCode = async (toPhoneNumber, code) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    throw new Error('Twilio Verify credentials are not configured in your .env file.');
  }

  const client = twilio(accountSid, authToken);

  const check = await client.verify.v2.services(serviceSid)
    .verificationChecks
    .create({ to: toPhoneNumber, code });

  return check.status === 'approved';
};

module.exports = {
  sendVerificationCode,
  checkVerificationCode,
};
