const { Server } = require('socket.io');
const express=require('express')
const http=require('http');
const { Socket } = require('dgram');

const app=express(

)
 const server=http.createServer(app)
 const io=new Server(server,{
  
        cors: {
          origin: "*",
     
        }
 })
 io.on('connection',(socket)=>{
    console.log('connected');
    socket.on('chat',chat=>{
        io.emit('chat',chat)
    })
    socket.on('disconnect',()=>{
        console.log('disconnect')
    })
 })
 server.listen("3001",()=>{
    console.log("running on 3001 port")
 })