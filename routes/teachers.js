const express = require('express');
const isAuthenticated = require('../middleware/isAuthenticated'); 
const Teacher = require('../models/Teacher'); 
const User = require('../models/User'); 

const router = express.Router();

router.get('/teachers', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); 
    const grade = user.grade; 

    const teachers = await Teacher.find({ grade: grade });

    res.render('team', { teachers: teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching teachers data' });
  }
});

module.exports = router;
