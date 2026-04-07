import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Register.css";

function Register(){

const navigate = useNavigate();

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [confirmPassword,setConfirmPassword] = useState("");
const [studentId,setStudentId] = useState("");
const [department,setDepartment] = useState("");
const [role,setRole] = useState("student");
const [showPassword,setShowPassword] = useState(false);
const [showConfirmPassword,setShowConfirmPassword] = useState(false);

const handleRegister = (e)=>{

e.preventDefault();

if(!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()){
alert("Fill all fields");
return;
}

if(password !== confirmPassword){
alert("Passwords do not match");
return;
}

const users = JSON.parse(localStorage.getItem("users")) || [];

// ✅ email case fix
const existingUser = users.find(
u => u.email.toLowerCase() === email.toLowerCase()
);

if(existingUser){
alert("User already exists");
return;
}

const newUser = {
name,
email,
password,
role
};

if(role === "student"){
newUser.studentId = studentId;
newUser.department = department;
}

users.push(newUser);

localStorage.setItem("users",JSON.stringify(users));

alert("Registration successful");

navigate("/login");

};

return(

<div className="register-container">

<form className="register-form" onSubmit={handleRegister}>

<h2 className="register-title">Create Account</h2>

<input
type="text"
placeholder="Full Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<div className="password-field">
<input
type={showPassword ? "text" : "password"}
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>
<span onClick={()=>setShowPassword(!showPassword)}>👁</span>
</div>

<div className="password-field">
<input
type={showConfirmPassword ? "text" : "password"}
placeholder="Confirm Password"
value={confirmPassword}
onChange={(e)=>setConfirmPassword(e.target.value)}
/>
<span onClick={()=>setShowConfirmPassword(!showConfirmPassword)}>👁</span>
</div>

{role === "student" && (
<>
<input
type="text"
placeholder="Student ID"
value={studentId}
onChange={(e)=>setStudentId(e.target.value)}
/>

<input
type="text"
placeholder="Department"
value={department}
onChange={(e)=>setDepartment(e.target.value)}
/>
</>
)}

<div className="role-group">

<label>
<input
type="radio"
value="student"
checked={role === "student"}
onChange={(e)=>setRole(e.target.value)}
/>
Student
</label>

<label>
<input
type="radio"
value="admin"
checked={role === "admin"}
onChange={(e)=>setRole(e.target.value)}
/>
Admin
</label>

</div>

<button className="register-button" type="submit">
Register
</button>

<p className="register-subtitle">
Already have an account?
<span onClick={()=>navigate("/login")}> Login</span>
</p>

</form>

</div>

)

}

export default Register;