const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
dotenv.config();
const app = express();
app.use(express.json());
const User = require('./models/User'); // Import the user model


app.use('/api/auth', authRoutes);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const path = require('path');
const port = 3000;

app.use(express.static(path.join(__dirname,'project', 'public')));
//app.use(express.static(path.join(__dirname, 'project','public', 'js')));

              
app.get('/login', (req, res) => {
res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.post('/signup', async (req, res) => {
  const { username, userId, email, password } = req.body;

   try {
    const existingUser = await User.findOne({ $or: [{ email }, { userId }] });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'You have already registered your account before. Click here to login',
        message: '/login'
      });
    }

     const newUser = new User({
      username,
      userId,
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

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'reset-password.html'));
});
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'views', 'index.html'));
});
