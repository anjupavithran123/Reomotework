import { useState } from "react";


import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from "./signup.jsx";
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Login from './login.jsx'
import Home from './Home.jsx'
import Chatlogin from './chatlogin.jsx'
import Chatcontainer from './chatcontainer.jsx'
import Members from "./member.jsx";
import FileUploader from './fileupload.jsx'
import ProfilepicUpload from './profilepic.jsx'
import CollaborativeWhiteboard from './whiteboard.jsx'
import DocumentEditor from './document/DocumentEditor.jsx'
import Taskboard from './taskbord/taskboard.jsx'
import  InviteForm from './emailinvite.jsx'
import VideoCall from "./videochat/videocall.jsx";

function App() {

 
  
   return(

    <div className="App">
 <BrowserRouter basename="/Reomotework">
    <Routes>
    <Route path='/' element={<Signup/>}></Route>
    <Route path='/Reomotework/login' element={<Login/>}></Route>
    <Route path='/Reomotework/home' element={<Home/>}></Route>
    <Route path='/Reomotework/chatbox' element={<Chatlogin/>}></Route>
    <Route path='/Reomotework/chatcontainer' element={<Chatcontainer/>}></Route>
    <Route path='/Reomotework/fileupload' element={<FileUploader/>}></Route> 
    <Route path='/Reomotework/profilepic' element={<ProfilepicUpload/>}></Route>
    <Route path='/Reomotework/whiteboard' element={<CollaborativeWhiteboard/>}></Route>
    <Route path='/Reomotework/members' element={<Members/>}></Route>
    <Route path='/Reomotework/document' element={<DocumentEditor/>}></Route>
    <Route path='/Reomotework/taskboard' element={<Taskboard/>}></Route>
    <Route path='/Reomotework/email' element={<InviteForm/>}></Route>

    <Route path='/Reomotework/videocall' element={<VideoCall/>}></Route>


    </Routes>
    </BrowserRouter>
    
    </div>
  )
}

 export default App;
