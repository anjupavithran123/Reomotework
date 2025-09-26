import React, { useState } from 'react'
import { FaReact } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import "./chatstyle.css"
import { debounce } from 'lodash';
import _ from 'lodash'

 const chatlogin = ({setUser}) => {

  const navigate = useNavigate();

  const [userName,setUserName]=useState()
    const handleUser=()=>{
      if(!userName)return;
      localStorage.setItem("user",userName)
      setUser(userName)
      localStorage.setItem("avatar","https://picsum.photos/id/${_.random(1,1000)}/200/300")
      
      navigate('/chatcontainer');
      
    }
  return (
    <div className='chat_container'>
    <div className='login_title'>
        <FaReact/>
        <h1>chatbox</h1>
    </div>
    <div className='login_form'>
        <input type="text" placeholder='Enter name' 
        onChange={(e)=>setUserName(e.target.value)}/>
        <button onClick={handleUser}>Login</button>
       
    </div>
    </div>
  )
}
export default chatlogin;