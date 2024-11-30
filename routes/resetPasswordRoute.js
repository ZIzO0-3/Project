const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
router.use(flash());
const crypto = require('crypto');
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}
router.post('/set-password', async (req, res) => {
  const {  tempPassword, newPassword, verifyPassword } = req.body;
const token = req.query.token; 
    if (!token) {
        return res.status(400).send('Token is required');
    }
  if (!newPassword || newPassword.length < 6) {
    req.flash('error', 'Password must be at least 6 characters long');
    return res.redirect(`/set-password?token=${encodeURIComponent(token)}`);
  }

  if (newPassword !== verifyPassword) {
    req.flash('error', 'Passwords do not match');
    return res.redirect(`/set-password?token=${encodeURIComponent(token)}`);
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() } // Check if token has expired
    });
    if (!user) {
      req.flash('error', 'Invalid or expired token');
      return res.redirect('/reset-password');
    }    

    const isTempPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);

    if (!isTempPasswordValid) {
      req.flash('error', 'Temporary password is invalid');
      return res.redirect(`/set-password?token=${encodeURIComponent(token)}`);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = newPassword;
    user.tempPassword = undefined;
    user.tempPasswordExpires = undefined;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    req.flash('success', 'Password updated successfully');
    res.redirect('/login');
  } catch (error) {
    console.error('Error resetting password:', error);
    req.flash('error', 'Server error, please try again later');
    res.redirect(`/set-password?token=${encodeURIComponent(token)}`);
  }
});

module.exports = router;
