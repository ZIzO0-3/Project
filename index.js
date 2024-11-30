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
  res.render('index');
});

app.get('/home', (req, res) => {
  const user = req.session.user || null; 
  res.render('index', { user }); 
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

app.post('/reset-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send('Email is required.');
  }

   console.log(`Reset password link sent to ${email}`);
  res.send('Reset password link has been sent to your email.');
});


app.get('/about',isAuthenticated, (req, res) => {
  if(!isAuthenticated) {
    res.render("login") 
   } else {
  res.render('about');
    } 
})

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



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


