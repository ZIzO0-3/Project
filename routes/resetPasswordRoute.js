const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();
/*router.post('/set-password', async (req, res) => {
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

    if (!user.tempPassword) {
      return res.status(400).json({ success: false, message: 'No temporary password found' });
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
module.exports = router*/
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
router.use(flash());
router.post('/set-password', async (req, res) => {
  const { tempPassword, newPassword, verifyPassword, email } = req.body;

  if (!newPassword || newPassword.length < 6) {
    req.flash('error', 'Password must be at least 6 characters long');
    return res.redirect('/set-password?email=' + encodeURIComponent(email));  // Redirect back to the page with error
  }

  if (newPassword !== verifyPassword) {
    req.flash('error', 'New password and confirm password do not match');
    return res.redirect('/set-password?email=' + encodeURIComponent(email));  // Redirect back to the page with error
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'Invalid email address');
      return res.redirect('/set-password?email=' + encodeURIComponent(email));  // Redirect back to the page with error
    }

    if (!user.tempPassword) {
      req.flash('error', 'No temporary password found');
      return res.redirect('/set-password?email=' + encodeURIComponent(email));  // Redirect back to the page with error
    }

    const isTempPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);

    if (!isTempPasswordValid || Date.now() > user.tempPasswordExpires) {
      req.flash('error', 'Temporary password is invalid or expired');
      return res.redirect('/set-password?email=' + encodeURIComponent(email));  // Redirect back to the page with error
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.tempPassword = undefined;
    user.tempPasswordExpires = undefined;

    await user.save();

    req.flash('success', 'Password has been updated successfully');
    res.redirect('/login');  // Redirect to login after successful password update
  } catch (error) {
    console.error('Error in /set-password route:', error);
    req.flash('error', 'Server error, please try again later');
    res.redirect('/set-password?email=' + encodeURIComponent(email));  // Redirect back to the page with error
  }
});

module.exports = router;
