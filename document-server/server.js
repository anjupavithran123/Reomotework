// server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import Delta from 'quill-delta';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4001;
const FRONTEND = (process.env.FRONTEND_ORIGIN || 'https://anjupavithran123.github.io').replace(/\/$/, '');

console.log('Starting server', { NODE_ENV: process.env.NODE_ENV, PORT: process.env.PORT, FRONTEND });

// Apply CORS for REST endpoints
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? true : FRONTEND,
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// In-memory document store
const docs = {};

// Configure socket.io with CORS so browser clients can connect
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? true : FRONTEND,
    methods: ['GET','POST']
  }
});

io.on('connection', (socket) => {
  console.log('socket connected:', socket.id);

  socket.on('join-doc', ({ docId, username } = {}) => {
    if (!docId) {
      socket.emit('error', { message: 'docId required to join' });
      return;
    }
    console.log(`${username || 'user'} joining doc ${docId}`);
    socket.join(docId);

    if (!docs[docId]) docs[docId] = new Delta();

    // send the current ops
    socket.emit('load-doc', docs[docId].ops);

    socket.username = username || 'Anonymous';

    // broadcast presence
    const room = io.sockets.adapter.rooms.get(docId) || new Set();
    const users = [];
    for (const id of room) {
      const s = io.sockets.sockets.get(id);
      users.push({ id, username: s?.username || 'Anonymous' });
    }
    io.to(docId).emit('presence', users);

    socket.on('send-delta', (delta) => {
      try {
        const incoming = new Delta(delta);
        docs[docId] = docs[docId].compose(incoming);
        socket.to(docId).emit('receive-delta', delta);

        const payload = { docId, updatedBy: socket.username, timestamp: Date.now() };
        io.to(docId).emit('doc-updated', payload);
        io.emit('doc-updated-all', payload);

        console.log('doc-updated emitted for', docId, 'by', payload.updatedBy);
      } catch (err) {
        console.error('delta compose error', err);
      }
    });

    socket.on('save-doc', () => {
      console.log(`Saving doc ${docId}: ops length ${docs[docId]?.ops?.length || 0}`);
      // persist if needed
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

app.get('/', (req, res) => res.send('🚀 Realtime doc server is running!'));

// Start server on 0.0.0.0 for Render
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
