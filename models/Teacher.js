const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  grade: {
    type: [String], // Define it as an array of strings
    required: true
}, 
   number: { type: Number, required: true}, 
  photo: { type: String, required: true }, 
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
