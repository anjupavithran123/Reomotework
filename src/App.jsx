

import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './signup.jsx'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Login from './login.jsx'
import Home from './Home.jsx'
import Chatlogin from './chatlogin.jsx'
import Chatcontainer from './chatcontainer.jsx'
import Doc from './doc.jsx'
import TodoList from './TodoList.jsx'
import FileUploader from './fileupload.jsx'
import ProfilepicUpload from './profilepic.jsx'
import CollaborativeWhiteboard from './whiteboard.jsx'
import MembersAndPresence from './member.jsx'
import DocumentEditor from './document/DocumentEditor.jsx'
import Taskboard from './taskbord/taskboard.jsx'

function App() {
   return(

     <div className="App">

  

    <BrowserRouter>
    <Routes>
    <Route path='/register' element={<Signup/>}></Route>
    <Route path='/login' element={<Login/>}></Route>
    <Route path='/home' element={<Home/>}></Route>
    <Route path='/chatbox' element={<Chatlogin/>}></Route>
    <Route path='/chatcontainer' element={<Chatcontainer/>}></Route>
    {/* <Route path='/doc' element={<Doc/>}></Route> */}
    {/* <Route path='/todolist' element={<TodoList/>}></Route> */}
    <Route path='/fileupload' element={<FileUploader/>}></Route> 
    <Route path='/profilepic' element={<ProfilepicUpload/>}></Route>
    <Route path='/whiteboard' element={<CollaborativeWhiteboard/>}></Route>
    <Route path='/members' element={<MembersAndPresence/>}></Route>
    <Route path='/document' element={<DocumentEditor/>}></Route>
    <Route path='/taskboard' element={<Taskboard/>}></Route>




    </Routes>
    </BrowserRouter>
    
    </div>
  )
}

 export default App;
