const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const isAuthenticated = require('../middleware/isAuthenticated'); // Middleware for teacher login
const router = express.Router();
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { subject, className } = req.body;
    const dir = `./month-marks/${subject}/${className}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); 
    }
    cb(null, dir); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.get('/upload-monthly-marks', isAuthenticated, async (req, res) => {
  const teacher = await Teacher.findOne({ email: req.session.user.email });
  if (!teacher) return res.redirect('/login');
   const user = req.session.user || null; 
   let userdata = null;  
   const errorMessage = req.session.errorMessage || null;  
   if (user) {
        userdata = await User.findOne({ email: user.email });
  }   
  const subjects = [
    'application','mathematics', 'chemistry', 'physics', 'biology', 'arabic', 'EOL', 'EAL', 'French', 'German'
  ];
  req.session.errorMessage = null; 
  res.render('upload-marks-monthly', {errorMessage: errorMessage, user:userdata, teacher, subjects });
});

router.post('/upload-monthly-marks', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ email: req.session.user.email });
    const { subject, classNames } = req.body;
    const file = req.file;

    if (!teacher) {
      return res.redirect("/home");
    }

    if (!classNames || !subject || !file) {
      return res.status(400).send("Missing required fields.");
    }

    // Process classNames correctly
    let classNamesArray = classNames.split('/').map(className => className.trim());

    console.log("Parsed classNames array:", classNamesArray); // Add debugging

    if (classNamesArray.length === 0) {
      return res.status(400).send("No valid class names provided.");
    }

    const subjectFolder = path.join(__dirname, '../uploads/month-marks', subject);
    if (!fs.existsSync(subjectFolder)) {
        fs.mkdirSync(subjectFolder, { recursive: true });
    }

    classNamesArray.forEach((className) => {
        if (!className) {
            console.error("Skipping invalid class name:", className);
            return;
        }

        const classFolder = path.join(subjectFolder, className);
        if (!fs.existsSync(classFolder)) {
            fs.mkdirSync(classFolder, { recursive: true });
        }

        // Check if the file already exists in the target directory
        const filePath = path.join(classFolder, file.filename);
        if (fs.existsSync(filePath)) {
            console.log("File already exists in:", filePath);
            return;
        }

        // Move the file to the class folder
        fs.renameSync(file.path, filePath);
        console.log(`File uploaded to ${filePath}`);
    });

    console.log(`File uploaded successfully for classes: ${classNamesArray.join(', ')}`);
    res.redirect('/home');
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).send('Failed to upload the file.');
  }
});

module.exports = router;