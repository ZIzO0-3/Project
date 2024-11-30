/*const express = require('express');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Route to handle sending the temporary password (POST /reset-password)
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  // Log the received email to confirm the input
  console.log('Received email:', email);

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(400).json({ error: 'No user found with that email address.' });
    }

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(4).toString('hex'); // Temporary password (8 characters)

    // Log the temporary password for debugging
    console.log(`Generated temporary password for ${email}: ${tempPassword}`);

    // Configure the email transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "eslammashorr@gmail.com", // Your email address
        pass: "Alaaemad4", // Your email password or app password
      },
    });

    const mailOptions = {
      from: "eslammashorr@gmail.com",
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Your temporary password is: \n\n${tempPassword}\n\n` +
            `Please use this temporary password to reset your password. This password is valid for 1 hour.`,
    };

    // Send the email with the temporary password
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ error: 'Failed to send email.' });
      }

      // Log the email sending process for debugging
      console.log(`Email sent to ${user.email}: ${info.response}`);

      // Update the user's temporary password in the database
      user.tempPassword = bcrypt.hashSync(tempPassword, 10); // Hash the temporary password
      user.tempPasswordExpires = Date.now() + 3600000; // Temporary password valid for 1 hour
      user.save();

      // Send the response
      console.log(`Reset password link sent to ${user.email}`);  // This is the message you're seeing
      res.status(200).json({ message: 'Temporary password sent! Please check your email to reset your password.' });
    });
  } catch (error) {
    console.error('Error in /reset-password route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;*/

// routes/resetPasswordRoute.js
const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();

// POST route to handle setting the new password
router.post('/set-password', async (req, res) => {
  const { tempPassword, newPassword, verifyPassword, email } = req.body;

  // Validate new passwords
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  if (newPassword !== verifyPassword) {
    return res.status(400).json({ success: false, message: 'New password and confirm password do not match' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    // Check if the temporary password is correct
    const isTempPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);

    if (!isTempPasswordValid || Date.now() > user.tempPasswordExpires) {
      return res.status(400).json({ success: false, message: 'Temporary password is invalid or expired' });
    }

    // Hash the new password and update the user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.tempPassword = undefined;
    user.tempPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password has been updated successfully' });
  } catch (error) {
    console.error('Error in /set-password route:', error);
    res.status(500).json({ success: false, message: 'Server error, please try again later' });
  }
});

module.exports = router;


