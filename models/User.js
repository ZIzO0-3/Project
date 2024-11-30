const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  userId: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  tempPassword: { type: String },
  tempPasswordExpires: { type: Date },
  resetToken: { type: String },
  resetTokenExpires: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
