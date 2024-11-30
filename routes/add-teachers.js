const express = require('express');
const multer = require('multer');
const isAuthenticated = require('../middleware/isAdmin'); 
const isAdmin = require('../middleware/isAdmin'); 
const Teacher = require('../models/Teacher');
const path = require('path');

const router = express.Router();

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save file in 'uploads/' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Create a unique filename
    }
});

const upload = multer({ storage: storage });

router.get('/add-teachers', isAuthenticated, isAdmin, (req, res) => {
  const successMessage = req.query.success ? "Teacher added successfully!" : null;
  const errorMessage = req.query.error ? "There was an error adding the teacher." : null;
  res.render('add-teachers', {
    successMessage: successMessage, 
    errorMessage: errorMessage
  });
});

router.post('/add-teachers', isAuthenticated, isAdmin, upload.single('photo'), async (req, res) => {
    console.log('POST /add-teachers triggered');
    
    try {
        const { name, subject, grade, teacherNumber, work } = req.body;
        const photo = req.file ? req.file.filename : null; // Handle photo upload

        const teacherNumberParsed = Number(teacherNumber);

        console.log('Request Body:', req.body); // Log the incoming data for debugging
        console.log('Uploaded Photo:', photo); // Log uploaded photo filename
        console.log('Parsed teacherNumber:', teacherNumberParsed); // Log parsed teacherNumber

        if (!subject || !teacherNumberParsed || !photo) {
            console.log('Missing required fields.');
            return res.redirect('/add-teachers?error=true'); // Ensure all fields are provided
        }

        const grades = grade === 'both' ? ['1st Secondary', '2nd Secondary'] : [grade];

        const newTeacher = new Teacher({
            name,
            subject,
            grade: grades,
            number: teacherNumber, // Use the parsed number
            work,
            photo
        });

        await newTeacher.save();
        console.log('Teacher added successfully');
        res.redirect('/add-teachers?success=true'); // Redirect to success page

    } catch (error) {
        console.error('Error adding teacher:', error); // Log full error object
        res.redirect('/add-teachers?error=true'); // Redirect to error page
    }
});



module.exports = router
