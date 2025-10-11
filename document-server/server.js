// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Delta = require('quill-delta'); // npm i quill-delta

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const PORT = process.env.PORT || 4000;

// In-memory document store: { [docId]: Delta }
const docs = {};

io.on('connection', (socket) => {
  console.log('socket connected:', socket.id);

  socket.on('join-doc', ({ docId, username }) => {
    console.log(`${username || 'user'} joining doc ${docId}`);
    socket.join(docId);

    if (!docs[docId]) {
      docs[docId] = new Delta();
    }

    socket.emit('load-doc', docs[docId].ops);

    // store username locally for this socket
    socket.username = username || 'Anonymous';

    // track presence (simple)
    const room = io.sockets.adapter.rooms.get(docId) || new Set();
    const users = [];
    for (const id of room) {
      const s = io.sockets.sockets.get(id);
      users.push({ id, username: s?.username || 'Anonymous' });
    }
    io.to(docId).emit('presence', users);

    socket.on('send-delta', (delta) => {
     // inside socket.on('send-delta', (delta) => { ... })
try {
  const incoming = new Delta(delta);
  const pendingNotify = {};
  docs[docId] = docs[docId].compose(incoming);
  socket.to(docId).emit('receive-delta', delta);

  const payload = {
    docId,
    updatedBy: socket.username || 'Anonymous',
    timestamp: Date.now(),
  };

  // room-scoped (existing)
  io.to(docId).emit('doc-updated', payload);

  // GLOBAL fallback so pages that aren't joined to the room still see updates (Home badge)
  io.emit('doc-updated-all', payload);

  console.log('doc-updated emitted for', docId, 'by', payload.updatedBy);
} catch (err) {
  console.error('delta compose error', err);
}

    });

    socket.on('save-doc', () => {
      console.log(`Saving doc ${docId}: ops length ${docs[docId].ops.length}`);
      // persist to disk / DB here if desired
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected', socket.id);
      const roomAfter = io.sockets.adapter.rooms.get(docId) || new Set();
      const usersAfter = [];
      for (const id of roomAfter) {
        const s = io.sockets.sockets.get(id);
        usersAfter.push({ id, username: s?.username || 'Anonymous' });
      }
      io.to(docId).emit('presence', usersAfter);
    });
  });
});

app.get('/', (req, res) => res.send('Realtime doc server is running'));
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
