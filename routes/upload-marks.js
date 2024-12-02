const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const isAuthenticated = require('../middleware/isAuthenticated'); // Middleware for teacher login
const Teacher = require('../models/Teacher');
const router = express.Router();

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

router.get('/upload', isAuthenticated, async (req, res) => {
  const teacher = await Teacher.findOne({ email: req.session.user.email });
  if (!teacher) return res.redirect('/login');
    
  const subjects = [
    'mathematics', 'chemistry', 'physics', 'biology', 'arabic', 'EOL', 'EAL', 'French', 'German'
  ];
  
  res.render('upload', { teacher, subjects });
});

router.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ email: req.session.user.email });
    const { subject, className } = req.body;
    
    if (!teacher || !teacher.classes.includes(className)) {
      return res.status(403).send('You are not authorized to upload for this class.');
    }

    console.log(`File uploaded to ${req.file.path}`);
    res.redirect('/upload-success');
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).send('Failed to upload the file.');
  }
});

module.exports = router;