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

    // initialize doc if first time
    if (!docs[docId]) {
      docs[docId] = new Delta(); // empty delta
    }

    // send current doc contents to new client
    socket.emit('load-doc', docs[docId].ops);

    // track presence (simple)
    const room = io.sockets.adapter.rooms.get(docId) || new Set();
    const users = [];
    for (const id of room) {
      const s = io.sockets.sockets.get(id);
      users.push({ id, username: s?.username || 'Anonymous' });
    }
    // store username locally for this socket
    socket.username = username || 'Anonymous';
    io.to(docId).emit('presence', users);

    // handle deltas sent by client
    socket.on('send-delta', (delta) => {
      try {
        const incoming = new Delta(delta);
        // compose into server document
        docs[docId] = docs[docId].compose(incoming);
        // broadcast delta to everyone else in room
        socket.to(docId).emit('receive-delta', delta);
      } catch (err) {
        console.error('delta compose error', err);
      }
    });

    // optional: save doc (persisting omitted here)
    socket.on('save-doc', () => {
      console.log(`Saving doc ${docId}: ops length ${docs[docId].ops.length}`);
      // persist to disk / DB here if desired
    });

    // handle disconnect and update presence
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
