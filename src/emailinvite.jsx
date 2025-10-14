import React, { useState } from "react";

export default function InviteForm({ workspaceId = "default-workspace", inviterName = "Admin" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  async function sendInvite(e) {
    e.preventDefault();
    setStatus({ loading: true });

    try {
      const resp = await fetch("http://localhost:4003/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, workspaceId, inviterName }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed");
      setStatus({ success: `Invite sent to ${email}` , link: data.inviteLink }); // link only for dev
      setEmail("");
    } catch (err) {
      setStatus({ error: err.message || "Error sending invite" });
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
    <div style={{ maxWidth: 480 }}>
      <h3>Invite member</h3>
      <form onSubmit={sendInvite}>
        <label>
          Email
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="person@example.com"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
        <div style={{ marginTop: 12 }}>
          <button type="submit">Send invite</button>
        </div>
      </form>

      <div style={{ marginTop: 12 }}>
        {status?.loading && <div>Sending…</div>}
        {status?.success && <div style={{ color: "green" }}>{status.success}</div>}
        {status?.error && <div style={{ color: "red" }}>{status.error}</div>}
        {/* dev: show link for testing */}
        {status?.link && (
          <div style={{ marginTop: 8 }}>
            <small>Dev invite link: <a href={status.link} target="_blank" rel="noreferrer">{status.link}</a></small>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
