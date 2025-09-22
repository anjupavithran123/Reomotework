import { useEffect, useState } from 'react'

import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './signup.jsx'
import { BrowserRouter,Routes,Route } from 'react-router-dom'

function App() {
  useEffect(()=>{
    const fetchData=async()=>{
   
      const res = await fetch('https://localhost:3000')
      const data=res.json()
      console.log(data)
}
fetchData
  },[])
  return(
    <div>
         <Signup/>
    </div>
    
  )
}

 export default App
