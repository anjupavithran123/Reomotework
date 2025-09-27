
import React,{useState} from 'react';

const Chatinput = (addMessage) => {
  const[message,setMessage]=useState()
  const sendMessage=()=>{
     addMessage({message})
    setMessage("")
  }
  return (
    <div className='inputtext_container'>
         <textarea name="message"
          id="message"
           placeholder="Type message and send"
           rows="6"
           onChange={(e)=>setMessage(e.target.value)}>

           </textarea>
         <button  onClick={()=>sendMessage()}>Send</button>
    </div>
  )
}

export default Chatinput;