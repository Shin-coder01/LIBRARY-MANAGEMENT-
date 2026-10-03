import { NavLink, useLocation } from "react-router-dom";
import { FiBell, FiMenu, FiSearch } from "react-icons/fi";
import "./Navbar.css";

function Navbar({ isMenuOpen, setOpen, search, setSearch }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isCatalog = location.pathname === "/books";
  const initials = (user.name || user.email || "L").slice(0, 1).toUpperCase();

  return (
    <header className="navbar">
      <button
        className="menu-btn"
        type="button"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
        onClick={() => setOpen((previous) => !previous)}
      >
        <FiMenu aria-hidden="true" />
      </button>
      <NavLink to="/dashboard" className="logo" aria-label="Bibliotheca dashboard">
        BIBLIOTHECA<span>.</span>
      </NavLink>
      <span className="nav-location">{isCatalog ? "Catalogue" : "Library workspace"}</span>
      <label className="nav-search" aria-label="Search the catalogue">
        <FiSearch aria-hidden="true" />
        <input
          type="search"
          placeholder="Search title or author"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <button className="nav-icon-btn" type="button" aria-label="Notifications">
        <FiBell aria-hidden="true" />
      </button>
      <NavLink to="/profile" className="profile-mark" aria-label="View profile">
        {initials}
      </NavLink>
    </header>
  );
}

export default Navbar;
