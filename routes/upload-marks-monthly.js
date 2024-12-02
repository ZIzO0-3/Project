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
    const { subject, classNames } = req.body;
    const classNamesArray = classNames.split('/').map(className => className.trim());
    const subjectDir = `./month-marks/${subject}`;

     if (!fs.existsSync(subjectDir)) {
      fs.mkdirSync(subjectDir, { recursive: true });
    }

    classNamesArray.forEach(className => {
      const classDir = `${subjectDir}/${className}`;
      if (!fs.existsSync(classDir)) {
        fs.mkdirSync(classDir, { recursive: true });
      }
    });

        cb(null, subjectDir); 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original filename without modification
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
    const classNamesArray = classNames.split('/').map(className => className.trim());

    if (classNamesArray.length === 0) {
      return res.status(400).send("No valid class names provided.");
    }

    const subjectFolder = path.join(__dirname, '../month-marks', subject);

    // Loop through each class and ensure the class folder exists inside the subject folder
    classNamesArray.forEach(className => {
      const classFolder = path.join(subjectFolder, className);

      // Ensure that the class folder exists, otherwise create it
      if (!fs.existsSync(classFolder)) {
        fs.mkdirSync(classFolder, { recursive: true });
      }

      // Check if the file already exists in the target directory
      const filePath = path.join(classFolder, file.originalname); // Use original filename
      if (fs.existsSync(filePath)) {
        console.log("File already exists in:", filePath);
        return; // Skip if file already exists
      }

      // Move the file to the class folder with the same name
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