import "./Navbar.css";

function Navbar({ setOpen, search, setSearch }) {
  return (
    <div className="navbar">
      <button className="menu-btn" onClick={() => setOpen(prev => !prev)}>
        ☰
      </button>

      <h2 className="logo">LIBRARY</h2>

      <input
        className="nav-search"
        type="text"
        placeholder="Search books..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}

export default Navbar;