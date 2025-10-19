// server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
console.log('NODE_ENV=', process.env.NODE_ENV);
console.log('PORT=', process.env.PORT);
console.log('__dirname=', __dirname);

// ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50 MB limit

// serve uploads
app.use('/uploads', express.static(uploadsDir));

// If you build a frontend into a "build" or "dist" folder, serve it:
const clientBuildPath = path.join(__dirname, 'build'); // change to "dist" if that's your output
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  // fallback to index.html for SPA routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/upload') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// health
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// upload route (field name 'profile' to match your client)
app.post('/upload', (req, res) => {
  upload.single('profile')(req, res, function (err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ success: false, error: err.message || 'Upload error' });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.json({ success: true, filename: req.file.filename, url: `/uploads/${req.file.filename}` });
  });
});

// fallback root for quick check
app.get('/', (req, res) => res.send('🚀 Profile pic server is running!'));

// global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

// start
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
