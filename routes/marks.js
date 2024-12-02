const express = require('express');
const isAuthenticated = require('../middleware/isAuthenticated'); // Middleware to check if user is logged in
const { getStudentMarksById } = require('../utils/excelHelper');
const router = express.Router();
const User = require('../models/User');
 /*    
router.get('/marks', isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    console.log(user.userid)
    if (!user || !user.userid) {
      console.log("No user ID found in session.");
      return res.redirect('/login');
    }

    const userdata = await User.findOne({ userId: user.userid }); // Use user.id here

    if (!userdata) {
      console.log("No user found with id:", user.id);
      return res.redirect('/login');
    }

    // Fetch student data using user.id
    const studentData = getStudentMarksById(user.userid);  // Use user.id here

    if (!studentData) {
      console.log("No student data found for user ID:", user.userid);
      return res.render('marks', { errorMessage: 'No marks found for your ID.', marks: null });
    }

    const { 'الرقم القومي للطالب': nationalId, ...marks } = studentData;

    res.render('marks', {
      user: userdata,
      student: req.session.user,
      marks,
      nationalId,
      errorMessage: null,
    });
  } catch (error) {
    console.error('Error fetching marks:', error.message);
    res.status(500).render('marks', { errorMessage: 'Failed to retrieve marks.', marks: null });
  }
});
*/
router.get('/marks', isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.userid) {
      console.log("No user ID found in session.");
      return res.redirect('/login');
    }

    const userdata = await User.findOne({ userId: user.userid });

    if (!userdata) {
      console.log("No user found with id:", user.userid);
      return res.redirect('/login');
    }

    // Fetch student data using user.userid
    const studentData = getStudentMarksById(user.userid);

    if (!studentData) {
      console.log("No student data found for user ID:", user.userid);
      return res.render('marks', { 
        errorMessage: 'No marks found for your ID.', 
        marks: null 
      });
    }

    const { 'الرقم القومي للطالب': nationalId, ...marks } = studentData;
console.log(studentData) 
    res.render('marks', {
      user: userdata,
      student: req.session.user,
      marks,
      nationalId,
      errorMessage: null,
    });
  } catch (error) {
    console.error('Error fetching marks:', error.message);
    res.status(500).render('marks', { errorMessage: 'Failed to retrieve marks.', marks: null });
  }
});

module.exports = router;