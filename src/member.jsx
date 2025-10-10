// Members.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [onlineIds, setOnlineIds] = useState([]); // strings
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const id = parsed?.id || parsed?._id || parsed?.user?.id || parsed?.user?._id;
      return { id: id ? String(id) : null, name: parsed?.name || parsed?.user?.name || "", email: parsed?.email || parsed?.user?.email || "" };
    } catch (e) {
      console.error("parse error", e);
      return null;
    }
  });
  const socketRef = useRef(null);

  // Listen for storage changes (login/out from other tabs)
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "user") {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : null;
          const id = parsed?.id || parsed?._id || parsed?.user?.id || parsed?.user?._id;
          setCurrentUser(id ? { id: String(id), name: parsed?.name || "", email: parsed?.email || "" } : null);
        } catch (err) {
          setCurrentUser(null);
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3001/members");
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to load members", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // Socket effect - depends only on primitive userId
 // --- inside Members.jsx (replace your socket-useEffect) ---
useEffect(() => {
  const userId = currentUser?.id;
  if (!userId) {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setOnlineIds([]);
    return;
  }

  // create ONE socket and disable auto reconnection so we don't loop
  const socket = io("http://localhost:3001", {
    transports: ["polling", "websocket"],
    autoConnect: false,
    reconnection: false, // important: do not auto reconnect while debugging
    timeout: 5000,
  });

  socketRef.current = socket;

  // connect manually once
  socket.connect();

  // handlers
  function onConnect() {
    console.log("[socket] connected", socket.id);
    socket.emit("user-online", String(userId));
  }
  function onDisconnect(reason) {
    console.log("[socket] disconnected", socket.id, "reason:", reason);
  }
  function onConnectError(err) {
    // VERY IMPORTANT: this shows why the connect failed (CORS, auth, ECONNREFUSED, etc.)
    console.error("[socket] connect_error:", err && err.message ? err.message : err);
    // since reconnection is disabled, we won't loop — but we can still cleanup
  }
  function onUpdate(ids) {
    if (!Array.isArray(ids)) return;
    setOnlineIds(ids.map(id => String(id)));
  }

  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  socket.on("connect_error", onConnectError);
  socket.on("update-online-status", onUpdate);

  // safety: after 6s, if not connected, log diagnostic and keep socket disconnected
  const timer = setTimeout(() => {
    if (!socket.connected) {
      console.warn("[socket] not connected after 6s — check server logs, CORS, network, or server crashes");
    }
  }, 6000);

  return () => {
    clearTimeout(timer);
    if (!socket) return;
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
    socket.off("connect_error", onConnectError);
    socket.off("update-online-status", onUpdate);
    try { socket.disconnect(); } catch (e) { /* ignore */ }
    socketRef.current = null;
  };
}, [currentUser?.id]);
// --- inside Members.jsx (replace your socket-useEffect) ---
useEffect(() => {
  const userId = currentUser?.id;
  if (!userId) {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setOnlineIds([]);
    return;
  }

  // create ONE socket and disable auto reconnection so we don't loop
  const socket = io("http://localhost:3001", {
    transports: ["polling", "websocket"],
    autoConnect: false,
    reconnection: false, // important: do not auto reconnect while debugging
    timeout: 5000,
  });

  socketRef.current = socket;

  // connect manually once
  socket.connect();

  // handlers
  function onConnect() {
    console.log("[socket] connected", socket.id);
    socket.emit("user-online", String(userId));
  }
  function onDisconnect(reason) {
    console.log("[socket] disconnected", socket.id, "reason:", reason);
  }
  function onConnectError(err) {
    // VERY IMPORTANT: this shows why the connect failed (CORS, auth, ECONNREFUSED, etc.)
    console.error("[socket] connect_error:", err && err.message ? err.message : err);
    // since reconnection is disabled, we won't loop — but we can still cleanup
  }
  function onUpdate(ids) {
    if (!Array.isArray(ids)) return;
    setOnlineIds(ids.map(id => String(id)));
  }

  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  socket.on("connect_error", onConnectError);
  socket.on("update-online-status", onUpdate);

  // safety: after 6s, if not connected, log diagnostic and keep socket disconnected
  const timer = setTimeout(() => {
    if (!socket.connected) {
      console.warn("[socket] not connected after 6s — check server logs, CORS, network, or server crashes");
    }
  }, 6000);

  return () => {
    clearTimeout(timer);
    if (!socket) return;
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
    socket.off("connect_error", onConnectError);
    socket.off("update-online-status", onUpdate);
    try { socket.disconnect(); } catch (e) { /* ignore */ }
    socketRef.current = null;
  };
}, [currentUser?.id]);

  const handleRefresh = async () => { await fetchMembers(); };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Members</h1>
            <p className="text-sm text-gray-500">All registered members and their online status</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="px-3 py-1 rounded border">Refresh</button>
            <div className="text-sm text-gray-600">
              {currentUser && currentUser.id ? (
                <span>Signed in as <strong>{currentUser.name || currentUser.email}</strong></span>
              ) : (
                <span style={{ color: "red" }}>Not signed in</span>
              )}
            </div>
          </div>
        </div>

        <div>
          {loading ? <p>Loading members…</p> : members.length === 0 ? <p>No members found.</p> : (
            <ul>
              {members.map(m => {
                const memberId = String(m._id || m.id);
                const isOnline = onlineIds.includes(memberId);
                const isSelf = currentUser && String(currentUser.id) === memberId;
                return (
                  <li key={memberId} style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid #eee" }}>
                    <div>
                      <strong>{m.name}</strong><div style={{ color: "#666" }}>{m.email}</div>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: 10,
                        background: isOnline ? "green" : "#ccc", display: "inline-block"
                      }} />
                      <span>{isOnline ? "Online" : "Offline"}</span>
                      {isSelf && <span style={{ padding: "2px 6px", border: "1px solid #ccc", borderRadius: 4 }}>You</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
