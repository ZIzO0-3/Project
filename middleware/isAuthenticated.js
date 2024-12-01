const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user; 
    return next();
  }
  return res.redirect('/login');
};

module.exports = isAuthenticated;
