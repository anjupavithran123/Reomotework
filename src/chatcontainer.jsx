import React, { useEffect, useState } from 'react'
import Chatlist from "./chatlist"
import Chatinput from './chatinput';
import Chatlogin from './chatlogin'
import socketIOClient from'socket.io-client'
const chatcontainer = () => {

  const [user,setUser]=useState(localStorage.getItem('user'))
   const socketio=socketIOClient('http://localhost:3001')
   const [chats,setChats]=useState([])


 useEffect(()=>{
  socketio.on('chat',(senderChats)=>{
    setChats(chats)

  } )
 })

 const sendToSocket=(chat)=>{
  socketio.emit('chat',chat)
 }
  const addMessage=(chat)=> {
    const newChat = {
      ...chat,
      user: localStorage.getItem('user'),
      avatar: localStorage.getItem('avatar')
    };


 setChats([...chat,newChat])
 sendToSocket([...chat,newChat])
}

const Logout=()=>{
  localStorage.removeItem("user")
  localStorage.removeItem("avatar")
  setUser('')

}
   return (
    <div className='chat_container'>

      {  user?(
        <div>
            <div className='chats_header'>
               <h4>
                username:{user}
               </h4>
               <div onClick={Logout} style={{cursor: 'pointer'}}> {/* Apply the click handler to the container */}
              <div className='chat_logout'></div> {/* Used for styling/icon */}
              <strong>Logout</strong>
</div>
            </div>
            <Chatlist chats={chats}/>
            <Chatinput addMessage={addMessage}/>
        </div>
      ):
      <Chatlogin setUser={setUser}/>
    }
    </div>
  )
}

export default chatcontainer;
