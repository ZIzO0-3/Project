const User = require('../models/User');

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id); 
    console.log(user) 
    console.log(user.role)
    if (!user || user.role !== 'admin') {
        return res.redirect('/home');
    }
    next(); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error checking user role' });
  }
};

module.exports = isAdmin;
