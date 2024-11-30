const express = require('express');
const User = require('../models/User');
const crypto = require('crypto'); // To generate a reset token
const nodemailer = require('nodemailer'); // For sending the email

const router = express.Router();

router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'No user found with that email address.' });
    }

    // Generate a reset token and set its expiry time
    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Configure the email transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please use the following link to reset your password: \n\n` +
        `https://feather-bald-hydrant.glitch.me/reset-password/${resetToken} \n\n` +
        `This link will expire in 1 hour. If you did not request this, please ignore this email.`,
    };

    
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ error: 'Failed to send email.' });
      }
      res.status(200).json({ message: 'Reset link has been sent to your email!' });
    });
  } catch (error) {
    console.error('Error in /reset-password route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

