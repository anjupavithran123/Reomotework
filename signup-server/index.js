// server.js
require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const http = require('http');
const { Server } = require('socket.io');

const EmployeeModel = require('./models/Employee');

const app = express();
const server = http.createServer(app);

// Socket.IO: allow all origins for dev. Lock this down in production.
const io = new Server(server, {
  cors: { origin: "*" },
  allowEIO3: true,
});

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());


const PORT = process.env.PORT || 3001;

// MongoDB connection (ensure URL is correct)
mongoose.connect(
  "mongodb+srv://anjupavithranm95_db_user:1234@cluster0.xyiidkl.mongodb.net/employee",
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(()=>console.log("Mongo connected")).catch(e=>console.error("Mongo error", e));


// quick debug: print whether env var exists
console.log('MONGO_URI length:', (process.env.MONGO_URI || '').length);

// Helpful mongoose setting
mongoose.set('strictQuery', false);

(async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI missing. Add it to your .env file or your environment.');
    process.exit(1);
  }

  console.log('Attempting MongoDB connect...');
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // fail fast during debugging
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error (failed to connect):', err && err.message ? err.message : err);
    console.error(err);
    process.exit(1); // during dev this helps highlight the issue
  }
})();

// Track online users (userId -> Set of socketIds)
const onlineUsers = new Map();
function addOnline(userId, socketId) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
}
function removeOnlineBySocket(socketId) {
  for (const [userId, sockets] of onlineUsers.entries()) {
    if (sockets.has(socketId)) {
      sockets.delete(socketId);
      if (sockets.size === 0) onlineUsers.delete(userId);
      return userId;
    }
  }
  return null;
}

io.on('connection', (socket) => {
  console.log(new Date().toISOString(), 'Socket connected:', socket.id);

  socket.on('user-online', (userId) => {
    if (!userId) return;
    addOnline(userId, socket.id);
    io.emit('update-online-status', Array.from(onlineUsers.keys()));
  });

  socket.on('disconnect', (reason) => {
    const removedUser = removeOnlineBySocket(socket.id);
    if (removedUser) {
      io.emit('update-online-status', Array.from(onlineUsers.keys()));
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// ===== Routes ===== //

// Registration
app.post('/register', async (req, res) => {
  try {
    console.log('>>> /register payload:', JSON.stringify(req.body));
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      console.warn('Bad payload:', { name, email, password });
      return res.status(400).json({ success: false, message: 'Missing name, email or password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // check duplicate
    const existing = await EmployeeModel.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      console.log('Duplicate email:', normalizedEmail);
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await EmployeeModel.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    console.log('REGISTER success:', employee._id);
    return res.status(201).json({
      success: true,
      user: { id: employee._id, name: employee.name, email: employee.email },
    });
  } catch (err) {
    console.error('REGISTER error:', err && err.stack ? err.stack : err);

    if (err.name === 'ValidationError') {
      return res.status(422).json({ success: false, message: 'Validation failed', details: err.errors });
    }
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate key', details: err.keyValue });
    }

    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await EmployeeModel.findOne({ email: String(email).trim().toLowerCase() }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Incorrect password' });

    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('/login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Members list
app.get('/members', async (req, res) => {
  try {
    const members = await EmployeeModel.find({}, { name: 1, email: 1 }).lean();
    res.json(members);
  } catch (err) {
    console.error('/members error:', err);
    res.status(500).json({ error: err.message });
  }
});
// Optional root route — displays a simple message in browser
app.get('/', (req, res) => {
  res.send('🚀 Signup backend is running!');
});
// health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Start server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


