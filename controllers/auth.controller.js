const authService = require('../services/auth.service');
const passwordResetService = require('../services/passwordReset.service');
const sendEmail = require('../utils/sendEmail');


// @desc    Register user or technician
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const userData = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userData = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const result = await passwordResetService.sendResetOtp(req.body.email);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await passwordResetService.verifyOtp(email, otp);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};



// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await passwordResetService.resetPassword(email, otp, newPassword);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send contact page message to admin
// @route   POST /api/auth/contact
// @access  Public
const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const text = `New KeeBo Support Inquiry\n\nFull Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}\n\nSubmitted via KeeBo website contact form.`;

    // Send email to admin
    await sendEmail({
      to: adminEmail,
      subject: `[KeeBo Contact] ${subject}`,
      text,
      html: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #1f2937;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e5e7eb;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 35px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">New Contact Support Message</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.85); font-size: 14px; font-weight: 500;">Someone is trying to get in touch with KeeBo Support</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 40px;">
              <h2 style="margin-top: 0; margin-bottom: 24px; font-size: 18px; font-weight: 700; color: #111827; border-bottom: 2px solid #f3f4f6; padding-bottom: 12px;">Message Details</h2>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 10px 0; width: 120px; font-weight: 600; color: #4b5563; font-size: 14px; vertical-align: top;">Full Name:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #111827; font-size: 15px; vertical-align: top;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600; color: #4b5563; font-size: 14px; vertical-align: top;">Email Address:</td>
                  <td style="padding: 10px 0; font-size: 15px; vertical-align: top;"><a href="mailto:${email}" style="color: #4f46e5; text-decoration: none; font-weight: 700;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600; color: #4b5563; font-size: 14px; vertical-align: top;">Subject:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #111827; font-size: 15px; vertical-align: top;">${subject}</td>
                </tr>
              </table>
              
              <div style="background-color: #f9fafb; border-radius: 16px; padding: 24px; border: 1px solid #f3f4f6; margin-bottom: 10px;">
                <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Message</h3>
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px 40px; border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; font-weight: 500;">
                This inquiry was submitted via the contact form on your website.<br>
                Received at ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} (IST)
              </p>
            </div>
            
          </div>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Your message has been sent to the administrator successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  sendContactMessage,
};

