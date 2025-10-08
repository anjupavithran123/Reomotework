const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// simple in-memory online set (replace with Redis for multi-instance)
const onlineUsers = new Set();

io.on('connection', (socket) => {
  // client should send its userId after connecting
  socket.on('register', (userId) => {
    socket.userId = userId;
    onlineUsers.add(userId);
    io.emit('presence-update', { userId, status: 'online' });
  });

  socket.on('disconnect', () => {
    const u = socket.userId;
    if (u) {
      onlineUsers.delete(u);
      io.emit('presence-update', { userId: u, status: 'offline' });
    }
  });
});

server.listen(4000, () => console.log('server listening on 4000'));
