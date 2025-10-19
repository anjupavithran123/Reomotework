// src/pages/Signup.jsx
import React, { useState } from 'react';
import { API_BASE } from './config';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Use env variable if provided, else fallback to localhost

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, email, password };
      const res = await axios.post(`${API_BASE}/register`, payload, { timeout: 8000 });
      console.log('Server response:', res.data);
      alert('Registered successfully!');
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response) {
        console.error('Server status:', err.response.status);
        console.error('Server body:', err.response.data);
        alert(`Register failed: ${err.response.data?.message || JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        console.error('No response from server:', err.request);
        alert('No response from server. Is the backend running?');
      } else {
        console.error('Axios error:', err.message);
        alert(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: '80vh' }}>
      <div className="p-3 rounded w-25 border">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name"><strong>Name</strong></label>
            <input id="name" type="text" placeholder="Enter name" autoComplete="name" name="name"
                   className="form-control rounded" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="mb-3">
            <label htmlFor="email"><strong>Email</strong></label>
            <input id="email" type="email" placeholder="Enter email" autoComplete="email" name="email"
                   className="form-control rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="mb-3">
            <label htmlFor="password"><strong>Password</strong></label>
            <input id="password" type="password" placeholder="Enter password" name="password"
                   className="form-control rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-success w-100 rounded-0" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-3">Already have an account?</p>
        <Link to="/login" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">
          Login
        </Link>
      </div>
    </div>
  );
}

export default Signup;

function signup(){

const[name , setName]=useState()
const[email , setEmail]=useState()
const[password , setPassword]=useState()
const navigate = useNavigate()


const handleSubmit=(e)=>{
    e.preventDefault()
    axios.post('http://localhost:3001/register',{name,email,password})
    .then(result=>{console.log(result)
      navigate('/login')
 } )
    .catch(err=> console.log(err))

}


    return(
<div className='d-flex justify-content-center align-items-center  w-100'>
<div className=" p-3 rounded w-25">
  <h2>Register</h2> 
  <form onSubmit={handleSubmit}>
    <div className="mb-3">
        <label htmlFor="email">
            <strong>Name</strong>
        </label>
    <input type="text" 
        placeholder="enter name"
        autoComplete="off"
        name="email"
        className="form-control rounded"
        onChange={(e)=>setName(e.target.value)}

        /> 
    </div>

    <div className="mb-3">
        <label htmlFor=" Enter email">
            <strong>Email</strong>
        </label>
    <input type="text" 
        placeholder="enter email"
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
    Register
    
    </button>
    </form> 
    <p>Already have an account</p>
    <Link to="/login" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">
     Login
    </Link>


   
</div>
</div>
  
);
}


