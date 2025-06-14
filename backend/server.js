const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/music-school', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ['admin', 'teacher', 'student'] }
});
const User = mongoose.model('User', UserSchema);

const StudentSchema = new mongoose.Schema({
  name: String,
  surname: String,
  age: Number,
  phone: String,
  classes: [String], // koro, piyano, vs
  otherCourses: [{ name: String, hours: Number }]
});
const Student = mongoose.model('Student', StudentSchema);

// Auth middleware
const secret = 'secretKey';
function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);
  jwt.verify(token.split(' ')[1], secret, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
}

// Routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.sendStatus(401);
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.sendStatus(401);
  const token = jwt.sign({ id: user._id, role: user.role }, secret);
  res.json({ token });
});

app.get('/api/students', auth, async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.post('/api/students', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.sendStatus(403);
  }
  const student = new Student(req.body);
  await student.save();
  res.json(student);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
