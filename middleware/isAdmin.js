function isAuthenticated(req, res, next) {
    console.log('Request received:', req.method, req.url);
    console.log('User in req:', req.user); // Log the user
    if (req.user && req.user.id) {
        return next();
    }
    res.status(401).send('Unauthorized');
}
module.exports = isAuthenticated 