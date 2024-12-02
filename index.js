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
const flash = require('connect-flash'); 
dotenv.config();
const MongoStore = require('connect-mongo');
const isAdmin = require('./middleware/isAuthenticated'); 
const Teacher = require('./models/Teacher'); 
const teacherRoutes = require('./routes/teachers'); 
const addTeachersRoutes = require('./routes/add-teachers');
const app = express();
const editProfileRoutes = require('./routes/edit-profile');
const ProfileRoutes = require('./routes/profile');
const StudentMarks  = require('./routes/marks');

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'project', 'public')));
app.use(session({
  secret: "FO32",  
  resave: false, 
  saveUninitialized: true ,  
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: false , 
    maxAge: 1000 * 60 * 60 * 24 
  }
}));



mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next(); 
  }
  res.redirect('/login'); 
}

app.use((req, res, next) => {
  res.locals.messages = req.flash('error'); 
  res.locals.successMessages = req.flash('success'); 
  next();
});
app.use('/', addTeachersRoutes);
app.use('/', teacherRoutes);
app.use('/', editProfileRoutes);
app.use('/', ProfileRoutes);
app.use('/', StudentMarks);
app.use('/api/auth', authRoutes);
app.use('/reset-password', resetPasswordRoute);
app.use('/uploads', express.static('uploads'));
app.use('/img', express.static('img'));
app.get('/',async (req, res) => {
  const user = req.session.user || null; 
  let userdata = null;
  if (user) {
        userdata = await User.findOne({ email: user.email });
  }
  res.render('index', { user, user:userdata });
});

app.get('/home',async (req, res) => {
  const user = req.session.user || null; 
  let userdata = null;
  
  if (user) {
        userdata = await User.findOne({ email: user.email });
  }
  res.render('index', { user:userdata});
});

app.get('/login', (req, res) => {
  const passwordUpdated = req.session.passwordUpdated || false;
  const accountCreated = req.session.accountCreated || false;
  const errorMessage = req.session.errorMessage || null; 
  req.session.passwordUpdated = false;
  req.session.accountCreated = false;

  req.session.errorMessage = null; 
  res.render('login', {
    passwordUpdated: passwordUpdated,
    accountCreated,
    errorMessage: errorMessage,
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
  if (!user) {
      req.session.errorMessage= `I can't find account with this email . <a href="/signup">Click here</a> to signup.`
    return res.redirect('/login');
    
  };
  
    if (user.password !== password) {
      req.session.errorMessage = 'Invalid email or password'; 
      return res.redirect('/login');
    }
   const log = req.session.user = { userid: user.userId, id: user._id, email: user.email, grade: user.grade};    
     
    res.redirect('/home');
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/edit-profile', isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const passwordUpdated = req.session.passwordUpdated || false;
  const accountCreated = req.session.accountCreated || false;

  const errorMessage = req.session.errorMessage || null; 

 
    res.render('edit-profile', { user });
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/signup',async (req, res) => {
  const user = req.session.user || null; 
    let userdata = null;
  if (user) {
        userdata = await User.findOne({ email: user.email });
  } 
  res.render('signup', { errorMessage: null, user:userdata,user });
});

app.post('/signup', async (req, res) => {
  const { username, studentId, email, password,grade } = req.body;
   if (!username || !studentId || !email || !password) {
    return res.render('signup', { errorMessage: 'All fields are required.' });
  }
 
  try {
     const existingUser = await User.findOne({
      $or: [{ email: email }, { userId: studentId }],
    });
    if (existingUser) {
      return res.render('signup', {
        errorMessage:
          'You have already registered. <a href="/login">Click here</a> to login.',
      });
    }
    const newUser = new User({
      username,
      userId: studentId,
      email,
      password, 
      grade
    });
    await newUser.save();
    req.session.accountCreated = true;
    res.redirect('/login');
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).render('signup', {
      errorMessage: 'An unexpected error occurred. Please try again later.',
    });
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
const token = req.query.token; 

  console.log("Token from URL:", token); 
  
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

app.get('/about', async (req, res) => {
    const user = req.session.user || null; 
  let userdata = null;
  
  if (user) {
        userdata = await User.findOne({ email: user.email });
  }
  res.render('about', { user:userdata});  
});
app.get('/contact', async (req, res) => {
    const user = req.session.user || null; 
  let userdata = null;
  
  if (user) {
        userdata = await User.findOne({ email: user.email });
  }res.render('contact', { user:userdata} );  
});
app.get('/teachers',isAuthenticated, async (req, res) => {
  try {
      const user = req.session.user || null; 
  let userdata = null;
  
  if (user) {
        userdata = await User.findOne({ email: user.email });
  }    const teachers = await Teacher.find();
    res.render('teachers', { user:userdata , teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/add-teachers', isAuthenticated, isAdmin, async (req, res) => {
  const user = req.session.user || null; 
      const successMessage = req.query.successMessage || null;
      const errorMessage = req.query.errorMessage || null; 
    let userdata = null;
  
  if (user) {
        userdata = await User.findOne({ email: user.email });
  }
  res.render('add-teachers', {user:userdata, successMessage, errorMessage}); 
});

app.use((req, res, next) => {
  res.locals.messages = req.flash('error');
  res.locals.successMessages = req.flash('success')
  next();
});


app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.redirect('/home');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login'); 
  });
});
// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error during logout');
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
/*
const https = require("https");
const fs = require("fs");

const fileUrl = "https://cdn.glitch.global/44000450-5b21-4d41-9441-1920bc9beab4/%D8%A7%D9%84%D8%B5%D9%81%20%D8%A7%D9%84%D8%AB%D8%A7%D9%86%D9%89%20%D8%A7%D9%84%D8%AB%D8%A7%D9%86%D9%88%D9%89.xlsx?v=1733130726812" ; // Replace with your file URL
const localPath = "./data/2sec-2nd.xlsx"; // Change the destination as needed

https.get(fileUrl, (response) => {
  const fileStream = fs.createWriteStream(localPath);
  response.pipe(fileStream);
  fileStream.on("finish", () => {
    fileStream.close();
    console.log("File downloaded and saved to:", localPath);
  });
});
*/

