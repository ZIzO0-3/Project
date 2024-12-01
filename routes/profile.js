const express = require('express');
const router = express.Router();
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');
const upload = require('../middleware/upload');
const bcrypt = require('bcryptjs');

router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
        const userdata = await User.findOne({ email:user.email });
    if (!user) return res.redirect('/login');
    res.render('profile', { user:userdata });
  } catch (error) {
    console.error('Error loading profile:', error.message);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router