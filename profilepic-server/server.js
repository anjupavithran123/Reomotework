const express = require("express");
const multer = require("multer");
const cors = require("cors");
const app = express();

app.use(cors());

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

app.listen(4000, () => console.log("Server running on port 4000"));
