import { useState } from "react";

function signup(){

    return(
<div className='d-flex justify-content-center align-items-center bg-secondary '>
<div className="bg-white p-3 rounded ">
  <h2>Register</h2> 
  <form >
    <div className="mb-3">
        <label htmlFor="email">
            <strong>Name</strong>
        </label>
    <input type="text" 
        placeholder="entername"
        autoComplete="off"
        name="email"
        className="form-control rounded"
        
        /> 
    </div>

    <div className="mb-3">
        <label htmlFor=" Enter email">
            <strong>Email</strong>
        </label>
    <input type="text" 
        placeholder="entername"
        autoComplete="off"
        name="email"
        className="form-control rounded"
        
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
        
        /> 
    </div>
<button  type="submit" className="btn btn-success w-100 rounded-0">
    Register
    
    </button>
    <p>Already have an account</p>
    <button type="submit" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">
     Login
    </button>


    </form> 
</div>
</div>
  
);
}
export default signup;