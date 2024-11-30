const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.post('/set-password', async (req, res) => {
  const { tempPassword, newPassword, verifyPassword, email } = req.body;

    if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  if (newPassword !== verifyPassword) {
    return res.status(400).json({ success: false, message: 'New password and confirm password do not match' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }
    const isTempPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);

    if (!isTempPasswordValid || Date.now() > user.tempPasswordExpires) {
      return res.status(400).json({ success: false, message: 'Temporary password is invalid or expired' });
    }

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


