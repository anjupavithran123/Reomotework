// InviteForm.jsx
// React component to send email invites to join a workspace.
// Usage: drop into your React app and point axios to your backend endpoint (/api/invites).

import React, { useState } from 'react';
import axios from 'axios';

export default function InviteForm({ workspaceName = 'My Workspace', registerUrl = 'http://localhost:5173/register' }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function validateEmail(e) {
    // simple email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSending(true);
    try {
      const payload = {
        email,
        role,
        workspaceName,
        registerUrl, // backend will use this as the base for invite link
      };

      // Example: POST /api/invites { email, role, workspaceName, registerUrl }
      const res = await axios.post('/api/invites', payload);

      if (res?.data?.ok) {
        setSuccess('Invite sent — ' + email);
        setEmail('');
        setMessage('');
      } else {
        setError(res?.data?.error || 'Failed to send invite');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || 'Failed to send invite');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-md p-6 border rounded-lg shadow-sm " >
      <h2 className="text-lg font-semibold mb-4">Invite someone to {workspaceName}</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* <div>
          <label className="block text-sm">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border rounded">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div> */}

        <div>
          <label className="block text-sm">Personal message (optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div className="flex items-center gap-2">
          <button type="submit" disabled={sending} className="px-4 py-2 rounded bg-blue-600 text-black">
            {sending ? 'Sending…' : 'Send invite'}
          </button>
          <button type="button" onClick={() => { setEmail(''); setMessage(''); setError(''); setSuccess(''); }} className="px-3 py-2 rounded border">
            Reset
          </button>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}
      </form>
    </div>
  );
}


