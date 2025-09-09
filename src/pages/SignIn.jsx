import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate, Link } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirect to home after successful sign-in
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4">Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-control mb-3"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="form-control mb-3"
        />
        {error && <p className="text-danger">{error}</p>}
        <button type="submit" className="btn btn-primary w-100">Sign In</button>
      </form>
      <p className="mt-3 text-center">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}
