// server.js
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ In-memory store (replace with DB later)
const invites = new Map();

// ✅ Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ignore certificate issues (good for dev)
  },
});

// ✅ Verify SMTP connection
transporter
  .verify()
  .then(() => console.log("📬 Mailer connected successfully"))
  .catch((err) => console.error("❌ Mailer verify failed:", err));
// Add before your routes
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// ✅ Route to send invites
app.post("/api/invites", async (req, res) => {
  try {
    const {
      email,
      role = "member",
      workspaceName = "My Workspace",
      registerUrl = "http://localhost:5173/register",
      message = "",
    } = req.body;

    if (!email) return res.status(400).json({ error: "Missing email" });

    // Generate one-time token
    const token = crypto.randomBytes(20).toString("hex");
    invites.set(token, { email, role, workspaceName, used: false, createdAt: Date.now() });

    // Invite link for the user
    const inviteLink = `${registerUrl}?token=${token}&email=${encodeURIComponent(email)}`;

    // Email content
    const html = `
      <div style="font-family:Arial, sans-serif;">
        <h2>You've been invited to join ${workspaceName}</h2>
        <p>${message || "Click below to accept the invite and register."}</p>
        <a href="${inviteLink}" 
          style="background:#2563eb;color:white;padding:10px 16px;text-decoration:none;border-radius:6px;">
          Accept Invite
        </a>
        <p style="margin-top:20px;">If you didn't expect this invite, you can safely ignore it.</p>
      </div>
    `;

    // Send the email
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: `Invite to join ${workspaceName}`,
      html,
    });

    console.log(`✅ Invite sent to ${email}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Invite send error:", err);
    res.status(500).json({ error: "Failed to send invite" });
  }
});

// ✅ Validate invite token
app.get("/api/invites/validate/:token", (req, res) => {
  const { token } = req.params;
  const invite = invites.get(token);

  if (!invite) return res.status(404).json({ valid: false, error: "Invalid token" });
  if (invite.used) return res.status(400).json({ valid: false, error: "Invite already used" });

  res.json({ valid: true, email: invite.email, role: invite.role, workspaceName: invite.workspaceName });
});

// ✅ Mark invite as used
app.post("/api/invites/consume/:token", (req, res) => {
  const { token } = req.params;
  const invite = invites.get(token);
  if (!invite) return res.status(404).json({ error: "Invalid token" });

  invite.used = true;
  invites.set(token, invite);
  res.json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, debug: `No route for ${req.method} ${req.originalUrl}` });
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Email invite server running on http://localhost:${PORT}`));
