const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  grade: {
    type: [String], // Support multiple grades
    required: true,
  },
  number: { type: Number, required: true },
  photo: { type: String, required: true }, // Add photo field for dynamic images
});

module.exports = mongoose.model('Teacher', teacherSchema);
