import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight, FiEye, FiEyeOff } from "react-icons/fi";
import PointillistScene from "../Components/PointillistScene";
import { readStorage, writeStorage } from "../common/storage";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    setError("");
    const users = readStorage("users", []);
    const user = (Array.isArray(users) ? users : []).find((item) => item.email?.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      setError("We couldn't find an account with that email. Check it or create an account.");
      return;
    }
    if (user.password !== password) {
      setError("That password doesn't match this account. Please try again.");
      return;
    }

    writeStorage("user", user);
    navigate("/dashboard");
  };

  return (
    <main className="auth-page">
      <section className="auth-story pointillist-host" aria-label="A quiet place to read">
        <PointillistScene variant="grove" />
        <Link className="auth-brand" to="/">BIBLIOTHECA<span>.</span></Link>
        <div className="auth-story-copy">
          <p className="auth-eyebrow"><span /> Your reading room</p>
          <h1>Make room<br />for a good story.</h1>
          <p>Borrow a book, pick up where you left off, and keep the next chapter close.</p>
        </div>
        <span className="auth-story-note">A little more quiet. A little more wonder.</span>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <Link className="auth-back" to="/"><FiArrowLeft aria-hidden="true" /> Back to home</Link>
          <p className="auth-kicker">Welcome back</p>
          <h2>Sign in to your library</h2>
          <p className="auth-description">Your shelves and reading time are waiting.</p>
          {location.state?.registered && <p className="auth-success" role="status">Your account is ready. Sign in to enter the library.</p>}

          <form className="auth-form" onSubmit={handleLogin}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="login-password">Password</label>
            <div className="auth-password-field">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {error && <p className="auth-feedback" role="alert">{error}</p>}
            <button className="auth-submit" type="submit">Enter the library <FiArrowUpRight aria-hidden="true" /></button>
          </form>

          <p className="auth-switch">New to Bibliotheca? <Link to="/register">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}

export default Login;
