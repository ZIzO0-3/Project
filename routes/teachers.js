/*const express = require('express');
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

     if (req.query.query) {
      const query = req.query.query.toLowerCase();
      teachers = teachers.filter((teacher) => {
        return (
          teacher.name.toLowerCase().includes(query) ||
          teacher.subject.toLowerCase().includes(query) ||
          teacher.number.toString().includes(query)
        );
      });
    }

    // Render the teachers page with filtered teachers
    res.render('teachers', { 
      teachers, 
      message: teachers.length ? null : 'No teachers found for your search query or grade'
    });
  } catch (error) {
    console.error('Error fetching teachers:', error.message);
    res.status(500).json({ message: 'Internal Server Error: Unable to fetch teacher data' });
  }
});

module.exports = router;*/
/*
const express = require('express');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');
const router = express.Router();

router.get('/teachers/search', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.redirect('/login');
        }

        const grade = user.grade;
        if (!grade) {
            console.error('User does not have a grade assigned.');
            return res.status(400).json({ message: 'User does not have a grade assigned' });
        }
let teachers = await Teacher.find({grade: user.grade}); 

        
      const query = req.query.query.trim().toLowerCase();

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

        
        console.log('Filtered Teachers:', teachers);
        res.render('teachers', { 
            teachers, 
            message: teachers.length ? null : 'No teachers found for your search query or grade'
        });
    } catch (error) {
        console.error('Error in /teachers/search route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;
*/
const express = require('express');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');
const router = express.Router();

// Route to get teachers and filter by search query
router.get('/teachers', isAuthenticated, async (req, res) => {
  try {
    // Fetch the logged-in user's grade
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.redirect('/login');
    }

    const grade = user.grade;
    if (!grade) {
      return res.status(400).json({ message: 'User does not have a grade assigned' });
    }

    // Fetch all teachers based on user's grade
    let teachers = await Teacher.find({ grade });

    // If there's a search query, filter the teachers
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

    // Render teachers page with filtered teachers
    res.render('teachers', { 
      teachers,
      query, // Pass the query so the input stays populated after submission
      message: teachers.length ? null : 'No teachers found matching your search', 
    });

  } catch (error) {
    console.error('Error fetching teachers:', error.message);
    res.status(500).json({ message: 'Internal Server Error: Unable to fetch teacher data' });
  }
});

module.exports = router;
