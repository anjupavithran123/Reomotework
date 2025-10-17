// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const EmployeeModel = require("./models/Employee");
const bcrypt = require("bcrypt");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Socket.IO attached to the same HTTP server
const io = new Server(server, {
  cors: {
    // In production restrict to your frontend origin e.g. "https://<your-username>.github
    origin: process.env.ALLOWED_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
  allowEIO3: true,
});

app.use(express.json());

// In production, set ALLOWED_ORIGIN to your GitHub Pages URL: https://<username>.github.io
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
}));

const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL ||
  "mongodb+srv://anjupavithranm95_db_user:1234@cluster0.xyiidkl.mongodb.net/employee";

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Mongo connected"))
  .catch(e => console.error("Mongo error", e));

// onlineUsers: Map<userId, Set<socketId>>
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

io.on("connection", (socket) => {
  console.log(new Date().toISOString(), "Socket connected:", socket.id);

  socket.on("user-online", (userId) => {
    if (!userId) return;
    addOnline(userId, socket.id);
    console.log(new Date().toISOString(), "user-online ->", userId, "-> socket", socket.id);
    io.emit("update-online-status", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", (reason) => {
    console.log(new Date().toISOString(), "Socket disconnected:", socket.id, "reason:", reason);
    const removedUser = removeOnlineBySocket(socket.id);
    if (removedUser) {
      console.log(new Date().toISOString(), "Removed socket from user:", removedUser);
      io.emit("update-online-status", Array.from(onlineUsers.keys()));
    }
  });

  socket.on("error", (err) => {
    console.error(new Date().toISOString(), "Socket error on", socket.id, err && err.message ? err.message : err);
  });
});

// Global process watchers (place near top-level)
process.on("uncaughtException", (err) => {
  console.error("UNCHECKED EXCEPTION", err && err.stack ? err.stack : err);
});
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION", reason);
});

// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();
    const exists = await EmployeeModel.findOne({ email: normalizedEmail }).lean();
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await EmployeeModel.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });
    // Avoid returning password
    const { password: _p, ...safe } = employee.toObject ? employee.toObject() : employee;
    res.json(safe);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    const user = await EmployeeModel.findOne({
      email: email.trim().toLowerCase(),
    }).lean();
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });

    res.json({
      success: true,
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all members
app.get("/members", async (req, res) => {
  try {
    const members = await EmployeeModel.find({}, { name: 1, email: 1 }).lean();
    res.json(members);
  } catch (err) {
    console.error("Members error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start the server using server.listen so Socket.IO works
server.listen(PORT, () => console.log(`Invite server running on ${PORT}`));
