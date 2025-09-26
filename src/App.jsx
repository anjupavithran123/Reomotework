

import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './signup.jsx'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Login from './login.jsx'
import Home from './Home.jsx'
import Chatlogin from './chatlogin.jsx'
import Chatcontainer from './chatcontainer.jsx'


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



    </Routes>
    </BrowserRouter>
    
    </div>
  )
}

 export default App;
