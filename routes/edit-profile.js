const express = require('express');
const router = express.Router();
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');
const upload = require('../middleware/upload');
const bcrypt = require('bcryptjs');

router.get('/edit-profile', isAuthenticated, async (req, res) => {
  try {
   
    const user = req.session.user || null;
    const errorMessage = req.session.errorMessage || null;  
    req.session.errorMessage = null; 
   if (!user) return res.redirect('/login');
   res.render('edit-profile', { user, errorMessage: errorMessage,});  // Render the edit-profile page with user data

  } catch (error) {
    console.error('Error loading edit profile page:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/update-profile', isAuthenticated, upload.single('profilePhoto'), async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
  
    const user = await User.findOne({ email });
 
    const userToUpdate = await User.findOne({ userId: user.userId });
  console.log(user.userId)
    if (!userToUpdate) {
      req.session.errorMessage = 'User not found';
      return res.redirect('/edit-profile');
    }
    let profilePhoto;
    if (req.file) {
      profilePhoto = '/uploads/profile_photos/' + req.file.filename;
    }

    
if (newPassword) {
      if (newPassword !== confirmPassword) {
        req.session.errorMessage = 'Passwords do not match';
        return res.redirect('/edit-profile');
      }
const hashedPassword = await bcrypt.hash(newPassword, 10);
      userToUpdate.password = hashedPassword;
    }
    if (profilePhoto) {
      userToUpdate.profilePhoto = profilePhoto;
    }

     await userToUpdate.save();
     req.session.user = userToUpdate;

    req.session.errorMessage = null;
    res.redirect('/profile');  
  } catch (error) {
    console.error('Error updating profile:', error.mess) 
 
    req.session.errorMessage = 'Internal Server Error';
    res.redirect('/edit-profile');
  }
});
module.exports = router