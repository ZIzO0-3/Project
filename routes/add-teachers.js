const express = require('express');
const isAuthenticated = require('../middleware/isAuthenticated'); 
const isAdmin = require('../middleware/isAuthenticated'); 
const Teacher = require('../models/Teacher');

const router = express.Router();

// Render add-teachers page (GET request)
router.get('/add-teachers', isAuthenticated, isAdmin, (req, res) => {
  res.render('add-teachers'); // Render the add-teachers.ejs view
});

// Handle adding a teacher (POST request)
router.post('/add-teachers', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, email, phone, grade } = req.body;

    // Ensure required fields are provided
    if (!name || !email || !phone || !grade) {
      return res.status(400).send('All fields are required');
    }

    // Create and save the new teacher
    const newTeacher = new Teacher({ name, email, phone, grade });
    await newTeacher.save();

    res.redirect('/teachers'); // Redirect to the teachers list page
  } catch (error) {
    console.error('Error adding teacher:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
/*const express = require('express');
const router = express.Router();
const isAdmin = require('./routes/isAdmins'); // Middleware to check admin role
const Teacher = require('./models/Teacher'); // Teacher model

// Ensure you have middleware for parsing form data
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

// POST route to handle form submission
router.post('/add-teachers', isAdmin, async (req, res) => {
    try {
        const { name, subject, grade, photo, number } = req.body;

            const grades = grade === 'both' ? ['1st Secondary', '2nd Secondary'] : [grade];

           const teacher = new Teacher({
      name,
      subject,
      grade,
      photo, 
      number
        });
        await teacher.save();

        res.redirect('/add-teachers?successMessage=true');
    } catch (error) {
        console.error('Error adding teacher:', error);
        res.redirect('/add-teachers?errorMessage=true');
    }
});

module.exports = router;

    res.status(500).json({ message: 'Error adding teacher' });
  }
});

module.exports = router;
*/