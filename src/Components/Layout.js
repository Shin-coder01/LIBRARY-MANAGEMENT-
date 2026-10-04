import { useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./Layout.css";

function Layout() {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");
  const menuButtonRef = useRef(null);

  const closeMenu = () => {
    setOpen(false);
    if (window.innerWidth <= 820) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  };

  return (
    <div className="app-container">
      <Navbar isMenuOpen={open} setOpen={setOpen} menuButtonRef={menuButtonRef} search={search} setSearch={setSearch} />
      <div className="layout">
        <Sidebar open={open} onClose={closeMenu} />
        <main className={`content ${open ? "shift" : ""}`}>
          <Outlet context={{ search }} />
        </main>
      </div>
    </div>
  );
}

export default Layout;
