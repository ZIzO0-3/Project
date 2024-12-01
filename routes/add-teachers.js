const express = require('express');
const multer = require('multer');
const isAuthenticated = require('../middleware/isAuthenticated'); 
const isAdmin = require('../middleware/isAuthenticated'); 
const Teacher = require('../models/Teacher');
const router = express.Router();
const fs = require('fs');
const path = require('path');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/png'];
    if (!allowedFileTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG and PNG files are allowed!'), false);
    }
    cb(null, true);
  }
});
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
        const photo = req.file ? req.file.filename : 'default-teacher.png'; 
        const teacherNumberParsed = parseInt(teacherNumber, 11);
        console.log('Request Body:', req.body); 
        console.log('Uploaded Photo:', photo); 
        console.log('Parsed teacherNumber:', teacherNumberParsed); 
        if (!subject || !teacherNumberParsed || !photo) {
            console.log('Missing required fields.');
            return res.redirect('/add-teachers?error=true'); 
        }
        const grades = grade === 'both' ? ['1st Secondary', '2nd Secondary'] : [grade];
        const newTeacher = new Teacher({
            name,
            subject,
            grade: grades,
            number: teacherNumber, 
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