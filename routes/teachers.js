const express = require('express');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');
const router = express.Router();

router.get('/teachers', isAuthenticated, async (req, res) => {
  try {
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.redirect('/login');
    }

    const grade = user.grade;
    if (!grade) {
      return res.status(400).json({ message: 'User does not have a grade assigned' });
    }
    
    let teachers = await Teacher.find({ grade });
    
    const query = req.query.query ? req.query.query.trim().toLowerCase() : '';
    if (query) {
      teachers = teachers.filter((teacher) => {
        const name = teacher.name ? teacher.name.toLowerCase() : '';
        const subject = teacher.subject ? teacher.subject.toLowerCase() : '';
        const number = teacher.number ? teacher.number.toString() : '';
        return (
          name.includes(query) ||
          subject.includes(query) ||
          number.includes(query)
        );
      });
    }
   
    res.render('teachers', { 
      teachers,
      query, 
      message: teachers.length ? null : 'No teachers found matching your search', 
    });

  } catch (error) {
    console.error('Error fetching teachers:', error.message);
    res.status(500).json({ message: 'Internal Server Error: Unable to fetch teacher data' });
  }
});

module.exports = router;
