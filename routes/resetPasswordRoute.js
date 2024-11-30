/*const express = require('express');
const User = require('../models/User');  // Assuming you have a User model
const crypto = require('crypto');       // To generate a reset token
const nodemailer = require('nodemailer'); // For sending emails

const router = express.Router();

// POST route to handle password reset request
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;  // Extract email from the form submission

  if (!email) {
    return res.status(400).send("Email is required");
  }

  try {
    const user = await User.findOne({ email });  // Find the user by email

    if (!user) {
      return res.status(400).send("No user found with that email address.");
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour validity

    await user.save();  // Save the user with the reset token

    // Set up email sending
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // Change to your email service provider
      auth: {
        user: process.env.EMAIL_USER,   // Your email address
        pass: process.env.EMAIL_PASS    // Your email password
      }
    });

    const resetLink = `http://yourdomain.com/reset-password/${resetToken}`; // URL with reset token

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      text: `Click the link below to reset your password:\n${resetLink}`,
      html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).send("Failed to send email.");
      }

      console.log("Email sent:", info.response);
      res.redirect('/login');  // Redirect to login after sending the reset email
    });

  } catch (error) {
    console.error("Error processing reset request:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
*/
// routes/resetPasswordRoute.js
const express = require('express');
const User = require('../models/User');
const crypto = require('crypto'); // To generate a reset token
const nodemailer = require('nodemailer'); // For sending email
const bcrypt = require('bcryptjs'); // For hashing passwords
const router = express.Router();

// Route to handle sending the temporary password
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'No user found with that email address.' });
    }

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(4).toString('hex'); // Temporary password (8 characters)

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
      text: `You requested a password reset. Your temporary password is: \n\n${tempPassword}\n\n` +
            `Please use this temporary password to reset your password. This password is valid for 1 hour.`,
    };

    // Send the email with the temporary password
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ error: 'Failed to send email.' });
      }

      // Update the user's temporary password in the database
      user.tempPassword = bcrypt.hashSync(tempPassword, 10); // Hash the temporary password
      user.tempPasswordExpires = Date.now() + 3600000; // Temporary password valid for 1 hour
      user.save();

      // Redirect to the reset page
      res.status(200).json({ message: 'Temporary password sent! Please check your email to reset your password.' });
    });
  } catch (error) {
    console.error('Error in /reset-password route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
// routes/resetPasswordRoute.js
router.get('/set-password/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // If the user's temporary password is expired
    if (Date.now() > user.tempPasswordExpires) {
      return res.status(400).json({ error: 'Temporary password has expired. Please request a new password reset.' });
    }

    // Render the form to set a new password
    res.render('set-password', { email }); // Pass the email to the form
  } catch (error) {
    console.error('Error in /set-password/:email route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// routes/resetPasswordRoute.js

router.post('/set-password', async (req, res) => {
  const { tempPassword, newPassword, email } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    // Check if the temporary password matches and hasn't expired
    const isTempPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);
    if (!isTempPasswordValid || Date.now() > user.tempPasswordExpires) {
      return res.status(400).json({ success: false, message: 'Temporary password is invalid or expired' });
    }

    // Hash the new password and update the user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.tempPassword = undefined; // Remove temporary password
    user.tempPasswordExpires = undefined; // Remove temporary password expiration

    await user.save();

    res.status(200).json({ success: true, message: 'Password has been updated successfully' });
  } catch (error) {
    console.error('Error in /set-password route:', error);
    res.status(500).json({ success: false, message: 'Server error, please try again later' });
  }
});

module.exports = router;
