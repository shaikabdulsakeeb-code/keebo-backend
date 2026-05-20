const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

/**
 * Generate a 6-digit OTP, hash it, store on user, and email it.
 */
exports.sendResetOtp = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorResponse('No account found with that email', 404);
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP before storing (same idea as hashing passwords)
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  // Store hashed OTP and expiry (10 minutes) using findOneAndUpdate
  // to reliably write select:false fields
  await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        resetOtp: hashedOtp,
        resetOtpExpire: new Date(Date.now() + 10 * 60 * 1000),
      },
    }
  );

  // 💻 DEVELOPER FEATURE: Print OTP clearly to the terminal console
  // console.log('\n=============================================');
  // console.log(`🔑 DEVELOPMENT RESET OTP FOR ${email}:`);
  // console.log(`👉 [ ${otp} ] 👈`);
  // console.log('=============================================\n');

  // Send email with OTP (Clean, high-deliverability copy without spam-triggering phrases or emojis)
  const text = `Hello ${user.name},\n\nWe received a request to reset your password. Your verification code is:\n\n${otp}\n\nThis verification code is valid for 10 minutes.\n\nIf you did not request a password reset, no action is needed.\n\nBest regards,\nKeeBo Support`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background-color: #2563EB; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">KeeBo</h1>
      </div>
      <div style="padding: 32px 24px; color: #374151; font-size: 15px; line-height: 1.6;">
        <p style="margin: 0 0 20px;">Hello <strong>${user.name}</strong>,</p>
        <p style="margin: 0 0 24px;">We received a request to reset your password. Please use the following verification code to proceed:</p>
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin: 0 0 24px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1e3a8a; font-family: 'Courier New', Courier, monospace;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">This verification code is valid for 10 minutes.</p>
        <p style="color: #6b7280; font-size: 13px; margin: 0;">If you did not request a password reset, no action is needed.</p>
      </div>
      <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} KeeBo. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'KeeBo Verification Code',
      html,
      text,
    });
  } catch (err) {
    // Clear OTP fields if email fails
    await User.findOneAndUpdate(
      { _id: user._id },
      { $unset: { resetOtp: '', resetOtpExpire: '' } }
    );
    throw new ErrorResponse('Email could not be sent. Please try again later.', 500);
  }

  return { message: 'OTP sent to your email address' };
};

/**
 * Verify the OTP entered by the user.
 */
exports.verifyOtp = async (email, otp) => {
  // 💻 DEVELOPER FEATURE: Accept universal '123456' in development environment
  if (process.env.NODE_ENV === 'development' && otp === '123456') {
    const mockHashed = crypto.createHash('sha256').update(otp + '_verified').digest('hex');

    // Save verified state on user so resetPassword step passes
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          resetOtp: mockHashed,
          resetOtpExpire: new Date(Date.now() + 5 * 60 * 1000),
        },
      }
    );

    console.log(`🔑 DEV MODE: Universal OTP bypass used for ${email}`);
    return { message: 'OTP verified successfully (Dev Mode Bypass)', verifiedToken: mockHashed };
  }

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    email,
    resetOtp: hashedOtp,
    resetOtpExpire: { $gt: new Date() },
  }).select('+resetOtp +resetOtpExpire');

  if (!user) {
    throw new ErrorResponse('Invalid or expired OTP', 400);
  }

  // Mark OTP as verified — extend expiry by 5 min for password reset step
  // but change the OTP so it can't be re-verified
  const verifiedToken = crypto.createHash('sha256').update(otp + '_verified').digest('hex');
  await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        resetOtp: verifiedToken,
        resetOtpExpire: new Date(Date.now() + 5 * 60 * 1000),
      },
    }
  );

  return { message: 'OTP verified successfully', verifiedToken };
};

/**
 * Reset the password after OTP verification.
 */
exports.resetPassword = async (email, otp, newPassword) => {
  // Check for the verified token (otp + '_verified')
  const verifiedToken = crypto.createHash('sha256').update(otp + '_verified').digest('hex');

  const user = await User.findOne({
    email,
    resetOtp: verifiedToken,
    resetOtpExpire: { $gt: new Date() },
  }).select('+resetOtp +resetOtpExpire +password');

  if (!user) {
    throw new ErrorResponse('Session expired. Please request a new OTP.', 400);
  }

  // Set new password and clear OTP fields
  user.password = newPassword;
  user.resetOtp = undefined;
  user.resetOtpExpire = undefined;
  await user.save();

  return { message: 'Password reset successful' };
};
