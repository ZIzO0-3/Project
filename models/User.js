const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  userId: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  grade: { type: String, required: true }, 
  role: { type: String, required: false }, 
  tempPassword: { type: String },
  tempPasswordExpires: { type: Date },
  resetToken: { type: String },
  resetTokenExpires: { type: Date }, 
  profilePhoto: { type: String }  // New field to store the profile photo URL or path
});

module.exports = mongoose.model('User', userSchema)