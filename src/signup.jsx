import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Signup() {
  const [name, setName] = useState("");          // initialize as empty string
  const [email, setEmail] = useState("");        // initialize as empty string
  const [password, setPassword] = useState("");  // initialize as empty string
  const navigate = useNavigate();

  // Use environment variable for backend URL
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://signup-server-ony0.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await axios.post(`${SERVER_URL}/register`, {
        name,
        email,
        password,
      });

      console.log(result.data);
      navigate("/login");  // redirect to login page on success
    } catch (err) {
      console.error(err);
      alert("Signup failed. Please try again.");  // simple error feedback
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: "100vh" }}>
      <div className="p-3 rounded w-25 border shadow">
        <h2 className="text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name">
              <strong>Name</strong>
            </label>
            <input
              type="text"
              placeholder="Enter name"
              autoComplete="off"
              name="name"
              id="name"
              className="form-control rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              placeholder="Enter email"
              autoComplete="off"
              name="email"
              id="email"
              className="form-control rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              placeholder="Enter password"
              name="password"
              id="password"
              className="form-control rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-success w-100 rounded-0">
            Register
          </button>
        </form>

        <p className="text-center mt-3">Already have an account?</p>
        <Link
          to="/login"
          className="btn btn-light border w-100 rounded-0 text-decoration-none"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default Signup;
