const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const path = require('path');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const session = require('express-session');
const resetPasswordRoute = require('./routes/resetPasswordRoute');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'project', 'public')));
app.use(session({
  secret: "FO32",  
  resave: true, 
  saveUninitialized: true,  
  cookie: { secure: false }  
}));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

function isAuthenticated(req, res, next) {
  if (req.session.userId) {  
    return next();  
  } else {
    res.redirect('/login');  
  }
}

app.use('/api/auth', authRoutes);
app.use('/reset-password', resetPasswordRoute);

app.get('/', (req, res) => {  
  const user = req.session.user || null; 
  res.render('index', { user });
});

app.get('/home', (req, res) => {
  const user = req.session.user || null; 
  res.render('index', { user });
});

app.get('/login', (req, res) => {
  const passwordUpdated = req.query.passwordUpdated;
  res.render('login',{
passwordUpdated,  errorMessage: req.flash('error') // If using flash messages for error handling
});
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user || user.password !== password) {
      return res.render('login', { errorMessage: 'Invalid email or password' });
    }

    req.session.user = user; 
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

  if (!username || !studentId || !email || !password) {
    return res.render('signup', { errorMessage: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email: email }, { userId: studentId }] });

    if (existingUser) {
      return res.render('signup', { errorMessage: 'You have already registered. <a href="/login">Click here</a> to login.' });
    }

    const newUser = new User({ username, userId: studentId, email, password });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/reset-password', (req, res) => {
  res.render('reset-password', { errorMessage: null });
});

app.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required.');
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('No user found with that email address.');
    }

    const tempPassword = crypto.randomBytes(4).toString('hex');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "eslammashorr@gmail.com",
        pass: "ukug efhf ivco auua",
      },
    });

    const mailOptions = {
      from: "eslammashorr@gmail.com",
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Your temporary password is: \n\n${tempPassword}\n\n` +
            `Please use this temporary password to reset your password. This password is valid for 1 hour.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).send('Failed to send email.');
      }

      user.tempPassword = bcrypt.hashSync(tempPassword, 10); 
      user.tempPasswordExpires = Date.now() + 3600000; 
      user.save();

      res.redirect(`/set-password?email=${encodeURIComponent(email)}`);
    });
  } catch (error) {
    console.error('Error in /reset-password route:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/set-password', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send('Email is required.');
  }

  res.render('set-password', { email });
});

app.post('/set-password', async (req, res) => {
  const { tempPassword, newPassword, email } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).send('Password must be at least 6 characters long');
  }

  if (!tempPassword) {
    return res.status(400).send('Temporary password is required');
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('Invalid email address');
    }

    const isTempPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);

    if (!isTempPasswordValid || Date.now() > user.tempPasswordExpires) {
      return res.status(400).send('Temporary password is invalid or expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.tempPassword = undefined; 
    user.tempPasswordExpires = undefined; 

    await user.save();
    res.status(200).send('Password has been updated successfully');
  } catch (error) {
    console.error('Error in /set-password route:', error);
    res.status(500).send('Server error, please try again later');
  }
});

app.get('/about', isAuthenticated, (req, res) => {
  res.render('about');
});

app.use((req, res, next) => {
  res.locals.user = req.session.user || null; 
  next();
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Failed to destroy session:', err);
      return res.status(500).send('Failed to log out.');
    }
    res.redirect('/login'); 
  });
});

app.post('/update-password', (req, res) => {
  const { userId, newPassword } = req.body;
  const users = []; 

  const user = users.find(u => u.id === userId);
  
  if (user) {
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).send('Error hashing password');
      }

      user.password = hashedPassword;
      res.redirect('/login?passwordUpdated=true');
    });
  } else {
    res.status(404).send('User not found');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
