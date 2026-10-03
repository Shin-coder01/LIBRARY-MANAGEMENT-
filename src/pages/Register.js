import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight, FiEye, FiEyeOff } from "react-icons/fi";
import PointillistScene from "../Components/PointillistScene";
import { readStorage, writeStorage } from "../common/storage";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = (event) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Those passwords don't match yet.");
      return;
    }
    if (role === "student" && (!studentId.trim() || !department.trim())) {
      setError("Add your student ID and department to finish setting up your reader profile.");
      return;
    }

    const storedUsers = readStorage("users", []);
    const users = Array.isArray(storedUsers) ? storedUsers : [];
    if (users.some((user) => user.email?.toLowerCase() === email.trim().toLowerCase())) {
      setError("An account with this email already exists. Try signing in instead.");
      return;
    }

    const newUser = { name: name.trim(), email: email.trim(), password, role };
    if (role === "student") {
      newUser.studentId = studentId.trim();
      newUser.department = department.trim();
    }
    writeStorage("users", [...users, newUser]);
    navigate("/login", { state: { registered: true } });
  };

  return (
    <main className="auth-page register-page">
      <section className="auth-story pointillist-host" aria-label="A quiet place to read">
        <PointillistScene variant="city" />
        <Link className="auth-brand" to="/">BIBLIOTHECA<span>.</span></Link>
        <div className="auth-story-copy">
          <p className="auth-eyebrow"><span /> A new chapter</p>
          <h1>Find your next<br />favourite shelf.</h1>
          <p>One thoughtful collection. Plenty of room to explore.</p>
        </div>
        <span className="auth-story-note">Start with one book. See where it takes you.</span>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap register-form-wrap">
          <Link className="auth-back" to="/"><FiArrowLeft aria-hidden="true" /> Back to home</Link>
          <p className="auth-kicker">Join the library</p>
          <h2>Create your account</h2>
          <p className="auth-description">Set up your reading profile in a few steps.</p>

          <form className="auth-form" onSubmit={handleRegister}>
            <label htmlFor="register-name">Full name</label>
            <input id="register-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />

            <label htmlFor="register-email">Email address</label>
            <input id="register-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

            <div className="auth-two-fields">
              <div>
                <label htmlFor="register-password">Password</label>
                <div className="auth-password-field">
                  <input id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <FiEyeOff /> : <FiEye />}</button>
                </div>
              </div>
              <div>
                <label htmlFor="register-confirm">Confirm password</label>
                <div className="auth-password-field">
                  <input id="register-confirm" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} required />
                  <button type="button" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword((value) => !value)}>{showConfirmPassword ? <FiEyeOff /> : <FiEye />}</button>
                </div>
              </div>
            </div>

            <fieldset className="role-options">
              <legend>Account type</legend>
              <label className={role === "student" ? "selected" : ""}>
                <input type="radio" name="role" value="student" checked={role === "student"} onChange={() => setRole("student")} />
                <span>Student</span>
              </label>
              <label className={role === "admin" ? "selected" : ""}>
                <input type="radio" name="role" value="admin" checked={role === "admin"} onChange={() => setRole("admin")} />
                <span>Administrator</span>
              </label>
            </fieldset>

            {role === "student" && (
              <div className="auth-two-fields">
                <div>
                  <label htmlFor="student-id">Student ID</label>
                  <input id="student-id" value={studentId} onChange={(event) => setStudentId(event.target.value)} required />
                </div>
                <div>
                  <label htmlFor="student-department">Department</label>
                  <input id="student-department" value={department} onChange={(event) => setDepartment(event.target.value)} required />
                </div>
              </div>
            )}

            {error && <p className="auth-feedback" role="alert">{error}</p>}
            <button className="auth-submit" type="submit">Create account <FiArrowUpRight aria-hidden="true" /></button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}

export default Register;
