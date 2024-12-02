const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated"); // Middleware to check if user is logged in
const { getStudentMarksById } = require("../utils/excelHelper");
const router = express.Router();
const User = require("../models/User");

router.get("/marks", isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user || null;
    let userdata = null;

    if (user) {
      userdata = await User.findOne({ email: user.email });
    }
    console.log(userdata.profilePhoto);
    console.log(userdata);
    const classSelect = req.query.class;
    const errorMessage = req.session.errorMessage || null;
    req.session.errorMessage = null;
    if (!classSelect) {
      return res.render("marks", {
        user: userdata,
        errorMessage: errorMessage,
        classSelect: "",
        marks: null,
      });
    }
    const filePath =
      classSelect === "1st" ? "./data/2sec-1st.xlsx" : "./data/2sec-2nd.xlsx";
    if (!user || !user.userid) {
      console.log("No user ID found in session.");
      return res.redirect("/login");
    }

    if (!userdata) {
      console.log("No user found with id:", user.userid);
      return res.redirect("/login");
    }

    const studentData = getStudentMarksById(user.userid, filePath); // Pass the file path to the function

    if (!studentData) {
      console.log("No student data found for user ID:", user.userid);
      return res.render("marks", {
        errorMessage: "No marks found for your ID.",
        marks: null,
        classSelect: classSelect,
        user: userdata,
      });
    }

    console.log("Student Data:", studentData);

    const {
      "الرقم القومى للطالب": nationalId = "N/A",
      الاسم: username = "NA",
      الكود: code,
      ...marks
    } = studentData;

    console.log("Marks:", marks);
    console.log("National ID:", nationalId);

    res.render("marks", {
      user: userdata,
      student: req.session.user,
      marks: marks,
      nationalId: nationalId,
      username: username,
      errorMessage: null,
      classSelect: classSelect,
    });
  } catch (error) {
    console.error("Error fetching marks:", error.message);
    res.status(500).render("marks", {
      errorMessage: "Failed to retrieve marks.",
      marks: null,
      classSelect: req.query.class || "2nd",
    });
  }
});

module.exports = router;
