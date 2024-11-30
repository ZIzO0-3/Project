const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  grade: { type: String, required: true }, 
  work: { type: String, required: true}, 
  number: { type: String, required: true}, 
  photo: { type: String, required: true }, 
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
