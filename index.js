const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const path = require('path');
const User = require('./models/User');
dotenv.config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const app = express();
const resetPasswordRoute = require('./routes/resetPasswordRoute'); // Update the path if necessary
const session = require('express-session');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
  secret: "FO32",  
  resave: true , 
  saveUninitialized: true,  
  cookie: { secure: false }  
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
  const user = req.session.user || null; 
  res.render('index', { user });  
});

app.get('/home', (req, res) => {
  const user = req.session.user || null; 
  res.render('index', { user }); 
});

app.get('/login', (req, res) => {
  const passwordUpdated = req.query.passwordUpdated;

  res.render('login', { passwordUpdated });
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

    if (user && user.password === password) {
      req.session.user = user; 
      return res.redirect('/home'); 
    }
      
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

  // Validate required fields
  if (!username || !studentId || !email || !password) {
    return res.render('signup', { 
      errorMessage: 'All fields are required.' 
    });
  }

  try {
    const existingUser = await User.findOne({ 
      $or: [{ email: email }, { userId: studentId }] 
    });

    if (existingUser) {
      return res.render('signup', {
        errorMessage: 'You have already registered. <a href="/login">Click here</a> to login.'
      });
    }

    const newUser = new User({
      username,
      userId: studentId, 
      email,
      password
    });

    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use('/reset-password', resetPasswordRoute);

app.get('/reset-password', (req, res) => {
  res.render('reset-password', { errorMessage: null });
});

app.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  // Ensure email is provided
  if (!email) {
    return res.status(400).send('Email is required.');
  }

  try {
    // Check if the user exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('No user found with that email address.');
    }

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(4).toString('hex'); // Temporary password (8 characters)
    
    // Log the temporary password for debugging
    console.log(`Generated temporary password for ${email}: ${tempPassword}`);

    // Configure the email transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "eslammashorr@gmail.com", // Your email address
        pass: "ukug efhf ivco auua" , // Your email password or app password
      },
    });

    const mailOptions = {
      from: "eslammashorr@gmail.com",
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Your temporary password is: \n\n${tempPassword}\n\n` +
            `Please use this temporary password to reset your password. This password is valid for 1 hour.`,
    };

    // Send the email with the temporary password
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).send('Failed to send email.');
      }

      // Update the user's temporary password in the database
      user.tempPassword = bcrypt.hashSync(tempPassword, 10); // Hash the temporary password
      user.tempPasswordExpires = Date.now() + 3600000; // Temporary password valid for 1 hour
      user.save();

       console.log(`Reset password link sent to ${email}`);

      res.redirect(`/set-password?email=${encodeURIComponent(email)}`);
    });

  } catch (error) {
    console.error('Error in /reset-password route:', error);
    res.status(500).send('Internal Server Error');
  }
});

// GET route to render the set-password page
app.get('/set-password', (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).send('Email is required.');
  }
  
  // Render the set-password page, passing the email to the view
  res.render('set-password', { email });
});

// POST route for updating the password
app.post('/set-password', async (req, res) => {
  const { tempPassword, newPassword, email } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).send('Password must be at least 6 characters long');
  }

  if (!tempPassword) {
    return res.status(400).send('Temporary password is required');
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('Invalid email address');
    }

    // Check if the temporary password matches the stored hashed password
    const isTempPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);
    
    if (!isTempPasswordValid || Date.now() > user.tempPasswordExpires) {
      return res.status(400).send('Temporary password is invalid or expired');
    }

    // If temporary password is valid, hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.tempPassword = undefined; // Remove the temporary password
    user.tempPasswordExpires = undefined; // Remove expiration time

    await user.save();

    res.status(200).send('Password has been updated successfully');
  } catch (error) {
    console.error('Error in /set-password route:', error);
    res.status(500).send('Server error, please try again later');
  }
});

module.exports = app;

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
const users = [] 
app.post('/update-password', (req, res) => {
    const { userId, newPassword } = req.body;
    
       const user = users.find(u => u.id === userId);
    
    if (user) {
        // Hash the new password
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).send('Error hashing password');
            }
            
            // Update the password (replace with actual DB update logic)
            user.password = hashedPassword;
            
            // Redirect to login page with success message
            res.redirect('/login?passwordUpdated=true');
        });
    } else {
        res.status(404).send('User not found');
    }
});
    }
    res.redirect('/login'); 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
