import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ open }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <nav className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/books">Books</NavLink>

        {user?.role === "admin" && (
          <>
            <NavLink to="/add-book">Add Book</NavLink>
            <NavLink to="/issue-book">Issue Book</NavLink>
          </>
        )}

        <NavLink to="/my-library">My Library</NavLink>
        <NavLink to="/profile">Profile</NavLink>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;