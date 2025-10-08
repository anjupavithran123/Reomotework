// Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';



export default function Login() {
  const [email, setEmail] = useState("");           // <- initialize to empty string
  const [password, setPassword] = useState("");     // <- initialize to empty string
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // --- DEBUG: print values before sending
    console.log("Submitting login:", { email, password });

    try {
      const resp = await axios.post("http://localhost:3001/login", { email, password }, {
        headers: { "Content-Type": "application/json" }
      });

      // --- DEBUG: log whole response
      console.log("Login response:", resp.status, resp.data);

      // Accept success if server sends { success: true }
      if (resp.status === 200 && resp.data && resp.data.success) {
        // optional: persist user/session
        // localStorage.setItem("user", JSON.stringify(resp.data.user))
        navigate("/home");
      } else {
        // show server message or generic
        setErrorMsg(resp.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || err.message || "Network or server error";
      setErrorMsg(msg);
    }
  };

  return (

    <div className="d-flex justify-content-center align-items-center  vh-100 ">

    <div className="bg-white p-3 rounded w-25">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            
          />
        </div>
<br />
        <button type="submit" >Login</button>
      </form>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </div>
    </div>
  );
}
