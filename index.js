/*const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const path = require('path');
const User = require('./models/User');
dotenv.config();
const app = express();
const session = require('express-session');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',  // You can set this as an environment variable
  resave: false,  // Don't save the session if unmodified
  saveUninitialized: true,  // Save uninitialized sessions
  cookie: { secure: false }  // Set to true if you're using HTTPS
}));
function isAuthenticated(req, res, next) {
  if (req.session.userId) {  
    return next();  
  } else {
    res.redirect('/login');  
  }
}
app.use(express.static(path.join(__dirname, 'project', 'public')));
app.use(express.json());
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/home', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user || user.password !== password) {
      return res.render('login', {
        errorMessage: 'Invalid email or password'
      });
    }

    
    req.session.userId = user._id;

    res.redirect('/home');  
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/signup', (req, res) => {
  res.render('signup', { errorMessage: null });
});

app.post('/signup', async (req, res) => {
  const { username, studentId, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email: email }, { studentId: studentId }] });
console.log(existingUser) 
    if (existingUser) {
      return res.render('signup', {
        errorMessage: 'You have already registered your account before. <a href="/login">Click here</a> to login.'
      });
    }

    const newUser = new User({
      username,
      userId: studentId,
      email,
      password
    });

    await newUser.save();
    console.log (newUser) 
    res.redirect('/login');
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/reset-password', (req, res) => {
  res.render('reset-password');
});
app.get('/about',isAuthenticated, (req, res) => {
  res.render('about');
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.redirect('/login');  
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const path = require('path');
const User = require('./models/User');
dotenv.config();
const app = express();
const session = require('express-session');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
  secret: "Fo" ,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true for HTTPS in production
}));


function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();  
  } else {
    res.redirect('/login');  
  }
}


app.use(express.static(path.join(__dirname, 'project', 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes and Middleware
app.use('/api/auth', authRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Protected home route
app.get('/home', isAuthenticated, (req, res) => {
  res.render('index');
});

// Login routes
app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.render('login', { errorMessage: 'Invalid email or password' });
    }

    req.session.userId = user._id;  // Set the user ID in the session
    res.redirect('/home');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/signup', (req, res) => {
  res.render('signup', { errorMessage: null });
});

app.post('/signup', async (req, res) => {
  const { username, studentId, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email: email }, { studentId: studentId }] });
    console.log(existingUser); 
    
    if (existingUser) {
      return res.render('signup', {
        errorMessage: 'You have already registered your account before. <a href="/login">Click here</a> to login.'
      });
    }

    const newUser = new User({
      username,
      userId: studentId,
      email,
      password
    });

    await newUser.save();
    console.log(newUser);
    res.redirect('/login');
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/reset-password', (req, res) => {
  res.render('reset-password');
});

app.get('/about', isAuthenticated, (req, res) => {
  res.render('about');
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.redirect('/login');  // Redirect to login page after logout
  });
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});