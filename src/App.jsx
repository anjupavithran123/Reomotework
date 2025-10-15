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
// import VideoCall from "./videochat/videocall.jsx";

function App() {

 
  
   return(

    <div className="App">
 <BrowserRouter basename="/Reomotework">
    <Routes>
    <Route path='/' element={<Signup/>}></Route>
    <Route path='/login' element={<Login/>}></Route>
    <Route path='/home' element={<Home/>}></Route>
    <Route path='/chatbox' element={<Chatlogin/>}></Route>
    <Route path='/chatcontainer' element={<Chatcontainer/>}></Route>
    <Route path='/fileupload' element={<FileUploader/>}></Route> 
    <Route path='/profilepic' element={<ProfilepicUpload/>}></Route>
    <Route path='/whiteboard' element={<CollaborativeWhiteboard/>}></Route>
    <Route path='/members' element={<Members/>}></Route>
    <Route path='/document' element={<DocumentEditor/>}></Route>
    <Route path='/taskboard' element={<Taskboard/>}></Route>
    <Route path='/email' element={<InviteForm/>}></Route>

    {/* <Route path='/videocall' element={<VideoCall/>}></Route> */}


    </Routes>
    </BrowserRouter>
    
    </div>
  )
}

 export default App;
