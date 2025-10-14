const express = require('express');
const http = require('http');        // ← Add this line
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app); // this will now work
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 4005;


io.on('connection', (socket) => {
console.log('🔌 socket connected', socket.id);


// join a room (roomId is a workspace or call identifier)
socket.on('join-room', ({ roomId, userName }) => {
console.log('join-room', { roomId, userName, id: socket.id });
socket.join(roomId);


// gather existing peers in the room (before this socket)
const clientsSet = io.sockets.adapter.rooms.get(roomId) || new Set();
const clients = Array.from(clientsSet);


// send existing clients list to the newly joined socket
// other server implementations may prefer to send back more metadata
socket.emit('all-users', { clients: clients.filter(id => id !== socket.id) });


// notify others that a new user has joined
socket.to(roomId).emit('user-joined', { socketId: socket.id, userName });
});


// forward signaling data to a specific target socket id
socket.on('signal', ({ to, from, data }) => {
// console.log('signal', { to, from });
io.to(to).emit('signal', { from, data });
});


socket.on('leave-room', ({ roomId }) => {
socket.leave(roomId);
socket.to(roomId).emit('user-left', { socketId: socket.id });
});


socket.on('disconnect', () => {
// When socket disconnects, announce to rooms it was part of
const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
rooms.forEach(roomId => {
socket.to(roomId).emit('user-left', { socketId: socket.id });
});
console.log('🔌 socket disconnected', socket.id);
});
});


server.listen(PORT, () => console.log(`Signaling server running on http://localhost:${PORT}`));


