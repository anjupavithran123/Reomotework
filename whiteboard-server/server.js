
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// keep lines in-memory (for demo only)
let whiteboardState = { lines: [] };

io.on('connection', (socket) => {
  console.log('client connected', socket.id);

  // send current state to newly connected clients
  socket.emit('syncState', whiteboardState);

  socket.on('draw', (line) => {
    whiteboardState.lines.push(line);
    socket.broadcast.emit('draw', line);
  });

  socket.on('clear', () => {
    whiteboardState.lines = [];
    io.emit('clear');
  });

  socket.on('undo', () => {
    // naive: remove last line
    whiteboardState.lines.pop();
    io.emit('undo');
  });

  socket.on('requestSync', () => {
    socket.emit('syncState', whiteboardState);
  });

  socket.on('disconnect', () => console.log('disconnect', socket.id));
});

server.listen(4001, () => console.log('listening on 4001'));
