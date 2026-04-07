import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {

    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please fill all fields");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      alert("Account not registered yet");
      return;
    }

    if (user.password !== password) {
      alert("Incorrect password");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));

    navigate("/dashboard"); 
  };

  return (

    <div className="login-page">

      <div className="login-overlay">

        <div className="login-box">

          <h1 className="login-logo">LIBRARY</h1>

          <h2>Sign In</h2>

          <form onSubmit={handleLogin}>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />

            <button type="submit">
              Sign In
            </button>

          </form>

          <p className="login-subtitle">
            New to Library?
            <span onClick={() => navigate("/register")}>
              Register now
            </span>
          </p>

        </div>

      </div>

    </div>

  );
}

export default Login;