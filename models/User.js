const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
/*
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
*/
// Define the user schema

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  userId: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },  
  resetPasswordExpires: { type: Date }  
});

module.exports = mongoose.model('User', userSchema);
