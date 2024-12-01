/*const express = require('express');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');
const router = express.Router();

router.get('/teachers', isAuthenticated, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const grade = user.grade;
    if (!grade) {
      return res.status(400).json({ message: 'Bad Request: User does not have a grade assigned' });
    }

    const teachers = await Teacher.find({ grade });
    res.render('team', {
      teachers,
      message: teachers.length ? null : 'No teachers found for your grade',
    });
  } catch (error) {
    console.error('Error fetching teachers data:', error.message);
    res.status(500).json({ message: 'Internal Server Error: Unable to fetch teachers data' });
  }
});

module.exports = router;*/
const express = require('express');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');
const router = express.Router();

router.get('/teachers', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const grade = user.grade;
    if (!grade) {
      return res.status(400).json({ message: 'User does not have a grade assigned' });
    }

    const teachers = await Teacher.find({ grade });
    res.render('teachers', { 
      teachers,
      message: teachers.length ? null : 'No teachers found for your grade', 
    });
  } catch (error) {
    console.error('Error fetching teachers:', error.message);
    res.status(500).json({ message: 'Internal Server Error: Unable to fetch teacher data' });
  }
});

module.exports = router;

