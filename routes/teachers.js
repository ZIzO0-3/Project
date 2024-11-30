const express = require('express');
const isAuthenticated = require('../middleware/isAdmin'); 
const Teacher = require('../models/Teacher'); 
const User = require('../models/User'); 

const router = express.Router();

router.get('/teachers', isAuthenticated, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).send('Bad Request: User not authenticated');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const grade = user.grade; // Assuming `grade` exists on the User model
    const teachers = await Teacher.find({ grade });

    res.render('team', { teachers });
  } catch (error) {
    console.error('Error fetching teachers data:', error);
    res.status(500).json({ message: 'Error fetching teachers data' });
  }
});

module.exports = router;
