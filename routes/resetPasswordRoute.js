const express = require('express');
const User = require('../models/User');
const crypto = require('crypto');  // To generate a reset token
const nodemailer = require('nodemailer');  // For sending the email

const router = express.Router();

router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'No user found with that email address.' });
    }
    
    const resetToken = crypto.randomBytes(20).toString('hex');

    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour validity
    await user.save();

    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset',
      text: `You requested a password reset. Use this token to reset your password: ${resetToken}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Failed to send email.' });
      }
      res.status(200).json({ message: 'Reset link sent to your email!' });
    });

  } catch (error) {
    console.error('Error in reset-password route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
