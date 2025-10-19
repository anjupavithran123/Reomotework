// server/index.js
import express from "express";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());

// Configure CORS: allow exact origin from FRONTEND_REGISTER_URL or allow all in dev
const FRONTEND = process.env.FRONTEND_REGISTER_URL?.replace(/\/$/, "") || "https://anjupavithran123.github.io/Reomotework";
const isDev = (process.env.NODE_ENV || "development") === "development";
console.log("FRONTEND:", FRONTEND, "NODE_ENV:", process.env.NODE_ENV);

app.use(cors({
  origin: isDev ? true : FRONTEND, // allow all in dev, exact origin in prod
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

const PORT = process.env.PORT || 4003;
const JWT_SECRET = process.env.JWT_SECRET || "replace_with_strong_secret";
const INVITE_EXPIRATION_SECONDS = 60 * 60 * 24 * 3; // 3 days

// configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// verify transporter at startup (log useful error if SMTP creds missing/bad)
transporter.verify().then(() => {
  console.log("SMTP transporter verified OK");
}).catch(err => {
  console.warn("SMTP transporter verification failed — invites will error. Set SMTP envs correctly.", err.message || err);
});

function createInviteToken({ email, workspaceId }) {
  const payload = { email, workspaceId };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: INVITE_EXPIRATION_SECONDS });
}

app.post("/api/invite", async (req, res) => {
  const { email, workspaceId = "default-workspace", inviterName = "Someone" } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const token = createInviteToken({ email, workspaceId });
    const inviteLink = `${(process.env.FRONTEND_REGISTER_URL || FRONTEND)}?token=${encodeURIComponent(token)}`;
    const html = `<p>${inviterName} invited you to join workspace <strong>${workspaceId}</strong>.</p>
                  <p><a href="${inviteLink}">Accept invite</a></p>
                  <p>Expires in 3 days.</p>`;

    const mailOptions = {
      from: `"${process.env.FROM_NAME || "My App"}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: `${inviterName} invited you to join ${process.env.APP_NAME || "our workspace"}`,
      html,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ ok: true, message: "Invite sent", inviteLink }); // include link in dev only
  } catch (err) {
    console.error("Invite error:", err && err.message ? err.message : err);
    return res.status(500).json({ error: "Failed to send invite", details: err?.message });
  }
});

app.post("/api/verify-invite", (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: "Token required" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, payload });
  } catch (err) {
    return res.status(400).json({ valid: false, error: err.message });
  }
});

app.get('/', (req, res) => res.send('🚀 Signup backend is running!'));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

// Use server.listen so http server/socket.io reuse later is consistent
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
