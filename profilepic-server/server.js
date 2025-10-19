import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import multer from 'multer';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json()); 
const PORT = process.env.PORT ||4000;

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("profile"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ message: "File uploaded successfully", filename: req.file.filename });
});

app.get('/', (req, res) => {
  res.send('🚀 Profile pic server is running!');
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
