import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";




function Login (){
    
const[email , setEmail]=useState()
const[password , setPassword]=useState()
const navigate =useNavigate()

const handleSubmit=(e)=>{
    e.preventDefault()


    axios.post('http://localhost:3001/login',{email,password})
    .then(result=> {
       console.log(result)
            if(result.data ==="success"){

                navigate('/home');
            }
     
 } )
    .catch(err=> console.log(err))

}


    return(
<div className='d-flex justify-content-center align-items-center  w-100 '>
<div className=" p-3 rounded w-25 ">
  <h2>Login</h2> 
 <form>
    <div className="mb-3">
        <label htmlFor=" Enter email">
            <strong>Email</strong>
        </label>
    <input type="text" 
        placeholder="entername"
        autoComplete="off"
        name="email"
        className="form-control rounded"
        onChange={(e)=>setEmail(e.target.value)}
        /> 
    </div>


    <div className="mb-3">
        <label htmlFor="email">
            <strong>password</strong>
        </label>
    <input type="password" 
        placeholder="enter password"
        name="password"
        className="form-control rounded"
        onChange={(e)=>setPassword(e.target.value)}
           
        /> 
    </div>
<button  type="submit" className="btn btn-success w-100 rounded-0">
    Login
    
    </button>
    </form> 

   
</div>
</div>
  
);
}



export default Login;