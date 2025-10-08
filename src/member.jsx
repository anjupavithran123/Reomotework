import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Default SOCKET_URL picks from env or localhost if not provided
const SOCKET_URL = import.meta.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

// MembersAndPresence component
// Props:
// - currentUserId (string) - id of logged in user (required to register presence)
// - usersApi (string) - endpoint to fetch registered users (defaults to /api/users)
export default function MembersAndPresence({ currentUserId, usersApi = '/api/users' }) {
  const [members, setMembers] = useState([]); // { id, name, avatar? }
  const [online, setOnline] = useState(new Set()); // set of userIds
  const socketRef = useRef(null);

  // fetch members once
  useEffect(() => {
    let cancelled = false;
    axios
      .get(usersApi)
      .then((res) => {
        if (!cancelled) setMembers(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch users', err);
      });
    return () => (cancelled = true);
  }, [usersApi]);

  // setup socket and presence listeners
  useEffect(() => {
    // create socket connection
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      // register current user for presence tracking
      if (currentUserId) socket.emit('register', currentUserId);
    });

    // initialize presence with a batch message (optional)
    // server might emit initial online list; handle both single updates and initial lists
    socket.on('presence-initial', (onlineList) => {
      setOnline(new Set(onlineList || []));
    });

    socket.on('presence-update', ({ userId, status }) => {
      setOnline((prev) => {
        const next = new Set(prev);
        if (status === 'online') next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    // optional: server could send an array of currently online users when you connect
    socket.on('online-users', (list) => setOnline(new Set(list || [])));

    socket.on('disconnect', () => {
      // keep UI but mark socket disconnected if you want
      console.log('socket disconnected');
    });

    return () => {
      if (socket && socket.connected && currentUserId) {
        // tell server you're leaving (optional) - server will handle disconnect too
        socket.emit('unregister', currentUserId);
      }
      socket.disconnect();
    };
  }, [currentUserId]);

  // helper render for avatar + status dot
  const MemberRow = ({ member }) => {
    const isOnline = online.has(member.id);
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
        <div className="relative">
          <img
            src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`}
            alt={member.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span
            className={`absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? 'bg-green-500' : 'bg-gray-300'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">{member.name}</div>
          <div className="text-xs text-gray-500">{member.email || ''}</div>
        </div>
        <div className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Members</h2>
        <div className="text-sm text-gray-600">Total: {members.length}</div>
      </div>

      <div className="bg-white shadow-sm rounded-lg divide-y">
        {members.length === 0 && (
          <div className="p-6 text-center text-gray-500">No registered members found.</div>
        )}
        {members.map((m) => (
          <MemberRow key={m.id} member={m} />
        ))}
      </div>
    </div>
  );
}
