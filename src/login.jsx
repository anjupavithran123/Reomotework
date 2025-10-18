// Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    console.log("Submitting login:", { email, password: password ? "••••" : "" });

    try {
      const resp = await axios.post("https://re-signup-server.onrender.com/login", { email, password }, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("Login response:", resp.status, resp.data);

      if (resp.status === 200 && resp.data && resp.data.success) {
        // Accept either resp.data.user or resp.data (fallback)
        const userObj = resp.data.user || resp.data;
        // normalize to expected minimal shape
        const safeUser = {
          id: String(userObj.id || userObj._id || userObj._id?.toString?.() || userObj.id?.toString?.()),
          name: userObj.name || "",
          email: userObj.email || email
        };

        // Persist user so Members page can read it
        localStorage.setItem("user", JSON.stringify(safeUser));
        console.log("Saved user to localStorage:", safeUser);

        // navigate to members page (so socket connects there)
        navigate("/home");
      } else {
        setErrorMsg(resp.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || err.message || "Network or server error";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="bg-white p-3 rounded w-25">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label>Email</label><br />
            <input
          
              type="email"
              className="form-control rounded"
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
              className="form-control rounded"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <br />
          <button type="submit" className="btn btn-success w-100">Login</button>
        </form>

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </div>
    </div>
  );
}
