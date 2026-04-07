import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile(){

const navigate = useNavigate();

const user = JSON.parse(localStorage.getItem("user")) || {};
const borrowed = JSON.parse(localStorage.getItem("borrowedBooks")) || [];
const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const logout = () => {
  localStorage.removeItem("user");
  navigate("/login");
};

return(

<div className="profile-page">

  <h1 className="profile-title">My Profile</h1>

  <div className="profile-card">
    <p><strong>Name:</strong> {user.name}</p>
    <p><strong>Email:</strong> {user.email}</p>
    <p><strong>Role:</strong> {user.role}</p>

    {user.role === "student" && (
      <>
        <p><strong>Student ID:</strong> {user.studentId}</p>
        <p><strong>Department:</strong> {user.department}</p>
      </>
    )}

    <button className="logout-btn" onClick={logout}>
      Logout
    </button>
  </div>

  <div className="profile-section">
    <h2>Borrowed Books</h2>

    {borrowed.length === 0 ? (
      <p>No books borrowed</p>
    ) : (
      borrowed.map((b, i)=>(
        <div key={i} className="profile-item">
          {b.title} - {b.author}
        </div>
      ))
    )}
  </div>

  <div className="profile-section">
    <h2>Favorite Books</h2>

    {favorites.length === 0 ? (
      <p>No favorites yet</p>
    ) : (
      favorites.map((b, i)=>(
        <div key={i} className="profile-item">
          {b.title} - {b.author}
        </div>
      ))
    )}
  </div>

</div>

)

}

export default Profile;