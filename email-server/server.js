// server/index.js
import express from "express";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); // allow react dev server
app.use(bodyParser.json());

const PORT = process.env.PORT || 4003;
const JWT_SECRET = process.env.JWT_SECRET || "replace_with_strong_secret";
const FRONTEND_REGISTER_URL = process.env.FRONTEND_REGISTER_URL || "http://localhost:5173/register";
const INVITE_EXPIRATION_SECONDS = 60 * 60 * 24 * 3; // invite valid for 3 days

// configure nodemailer transporter
// Example using a Gmail account via OAuth2 is preferred in prod; this is a simple SMTP example.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper: build invite token
function createInviteToken({ email, workspaceId }) {
  const payload = {
    email,
    workspaceId,
    // any other metadata
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: INVITE_EXPIRATION_SECONDS });
  return token;
}

// POST /api/invite
// body: { email: string, workspaceId?: string, inviterName?: string }
app.post("/api/invite", async (req, res) => {
  const { email, workspaceId = "default-workspace", inviterName = "Someone" } = req.body || {};

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // create token
    const token = createInviteToken({ email, workspaceId });

    // build link points to frontend register page
    const inviteLink = `${FRONTEND_REGISTER_URL}?token=${encodeURIComponent(token)}`;

    // email content (HTML)
    const html = `
      <p>Hi —</p>
      <p>${inviterName} invited you to join workspace <strong>${workspaceId}</strong>.</p>
      <p>Click to join: <a href="${inviteLink}">Accept invite</a></p>
      <p>If the link doesn't open, paste this URL into your browser:</p>
      <p><small>${inviteLink}</small></p>
      <hr/>
      <p>This link expires in ${Math.round(INVITE_EXPIRATION_SECONDS / (60*60*24))} days.</p>
    `;

    const mailOptions = {
      from: `"${process.env.FROM_NAME || "My App"}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: `${inviterName} invited you to join ${process.env.APP_NAME || "our workspace"}`,
      html,
    };

    // send
    await transporter.sendMail(mailOptions);

    return res.json({ ok: true, message: "Invite sent", inviteLink /* include for dev */ });
  } catch (err) {
    console.error("Invite error:", err);
    return res.status(500).json({ error: "Failed to send invite" });
  }
});

// Optional: endpoint to verify token from client if you want server-side verification
app.post("/api/verify-invite", (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: "Token required" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload contains email, workspaceId
    return res.json({ valid: true, payload });
  } catch (err) {
    return res.status(400).json({ valid: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Invite server running on ${PORT}`));
