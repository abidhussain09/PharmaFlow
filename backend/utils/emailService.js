const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp, shopName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `OTP for ${shopName} - Email Verification`,
    html: `<h3>Your OTP is: ${otp}</h3><p>It will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
