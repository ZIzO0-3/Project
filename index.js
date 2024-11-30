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
const flash = require('connect-flash'); // Add this line
dotenv.config();

const app = express();

  app.use(flash());
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
app.use((req, res, next) => {
  res.locals.messages = req.flash('error'); 
  res.locals.successMessages = req.flash('success'); 
  next();
});

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
  const passwordUpdated = req.session.passwordUpdated || false; 
  const errorMessage = req.flash('error');
  req.session.passwordUpdated = false; 
  res.render('login', {
    passwordUpdated: passwordUpdated,
    errorMessage: errorMessage.length > 0 ? errorMessage[0] : null
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
  req.flash('error', 'Invalid email or password');
  return res.redirect('/login');
}
    req.session.user = { id: user._id, email: user.email };
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
    const user = await User.findOne({ email});

    if (!user) {
      return res.status(400).send('No user found with that email address.');
    }
const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();
    const tempPassword = crypto.randomBytes(4).toString('hex');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "eslammashorr@gmail.com",
        pass: "ukug efhf ivco auua",
      },
    });
    console.log(user.email)
    const mailOptions = {
  from: "eslammashorr@gmail.com",
  to: user.email,
  subject: "Password Reset Request",
  html: `
    <!doctype html>
    <html>
    <head>
        <title>Password Reset</title>
        <style>
            body { background-color: #f9f9f9; margin: 0; padding: 0; font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #ddd; }
            .header { text-align: center; padding: 20px; background-color: #2F67F6; color: #fff; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 20px; text-align: center; }
            .button { background-color: #2F67F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            .footer { font-size: 12px; text-align: center; padding: 10px; color: #575757; }
        </style>
    </head>
    <body>
        <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>It seems that you’ve forgotten your password. Don’t worry; we’re here to help.</p>
            <p>Please use the button below to reset your password. Your temporary password is:</p>
            <p><strong>${tempPassword}</strong></p>
            <a href="https://feather-bald-hydrant.glitch.me/set-password?token=${token}" class="button">Reset Password</a>
            <p style="margin-top: 20px;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>Eslam Mashhor Language School</p>
        </div>
    </div>
</body>
</html>
  `,
};

transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).send('Failed to send email.');
      }

      user.tempPassword = bcrypt.hashSync(tempPassword, 10); 
      user.tempPasswordExpires = Date.now() + 3600000; 
      user.save();
      res.redirect(`/set-password?token=${encodeURIComponent(token)}`);    
    });
  } catch (error) {
    console.error('Error in /reset-password route:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/set-password', (req, res) => {
const token = req.query.token; 
    if (!token) {
     }
  res.render('set-password', { token});
});

app.post('/set-password', async (req, res) => {
  const { tempPassword, newPassword, email } = req.body;
const token = req.query.token; // Getting the token from the query string

  console.log("Token from URL:", token); // Debugging: Check if token is being received
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).send('Password must be at least 6 characters long');
  }

  if (!tempPassword) {
    return res.status(400).send('Temporary password is required');
  }
  
  try {
    const user = await User.findOne({ resetToken: token });

  if (!user) {
      req.flash('error', 'Invalid or expired token');
      return res.redirect('/reset-password');
    }

    const isTempPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);

    if (!isTempPasswordValid || Date.now() > user.tempPasswordExpires) {
      return res.status(400).send('Temporary password is invalid or expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = newPassword;
    console.log(newPassword) 
    user.tempPassword = undefined; 
    user.tempPasswordExpires = undefined; 

    await user.save();
    req.flash('success', 'Password updated successfully');
    res.redirect('/login'); 
  } catch (error) {
    console.error('Error resetting password:', error);
    req.flash('error', 'Server error, please try again later');
    res.redirect(`/set-password?token=${encodeURIComponent(token)}`);
  }
});

app.get('/about', isAuthenticated, (req, res) => {
  res.render('about');
});

app.use((req, res, next) => {
  res.locals.messages = req.flash('error');       // Pass error messages
  res.locals.successMessages = req.flash('success'); // Pass success messages
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
      user.password = newPassword;
      req.session.passwordUpdated = true;
      res.redirect('/login');
    });
  } else {
    res.status(404).send('User not found');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
