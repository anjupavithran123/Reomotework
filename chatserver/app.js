
require('dotenv').config();
const express = require('express')
const http = require('http')
const Server = require('socket.io').Server
const Connection = require('./db.js')
const mongoose = require("mongoose")
const Chat = require('./models/chat.js')
const { timeStamp } = require('console')

const app = express()
app.use(express.json())
Connection()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*"
    }
})
const PORT = process.env.PORT || 3001;

io.on("connection", (socket) => {
    console.log("connected");

    const loadMessages = async () => {
        try {
            const messages = await Chat.find().sort({timeStamp : 1}).exec();
            socket.emit('chat', messages)
        } catch(err) {
            console.log(err)
        }
    }
    loadMessages();

    socket.on('newMessage', async (msg) => {
        try {
            const newMessage = new Chat(msg)
            await newMessage.save()
            io.emit('message', msg)
        }catch(err) {
            console.log(err)
        }
    })

    socket.on("disconnect", () => {
        console.log("disconnect")
    })
})

app.get('/', (req, res) => {
    res.send('🚀 Signup backend is running!');
  });
  
  // Start server
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  
  