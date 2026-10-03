import { NavLink, useNavigate } from "react-router-dom";
import { FiBookOpen, FiGrid, FiLogOut, FiPlusCircle, FiSend, FiUser } from "react-icons/fi";
import "./Sidebar.css";

function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navItems = [
    { label: "Overview", path: "/dashboard", icon: FiGrid },
    { label: "Browse books", path: "/books", icon: FiBookOpen },
    ...(user.role === "admin" ? [
      { label: "Add a book", path: "/add-book", icon: FiPlusCircle },
      { label: "Issue desk", path: "/issue-book", icon: FiSend }
    ] : []),
    { label: "My library", path: "/my-library", icon: FiBookOpen },
    { label: "Profile", path: "/profile", icon: FiUser }
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const closeOnSmallScreens = () => {
    if (window.innerWidth <= 820) onClose();
  };

  return (
    <>
      {open && <button className="sidebar-scrim" type="button" aria-label="Close menu" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Library navigation">
        <div className="sidebar-heading">
          <span>Workspace</span>
          <span className="sidebar-role">{user.role || "reader"}</span>
        </div>
        <nav className="nav-links">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} onClick={closeOnSmallScreens}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>{user.name || "Your reading desk"}</p>
          <button className="logout-btn" type="button" onClick={handleLogout}>
            <FiLogOut aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
