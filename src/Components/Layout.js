import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./Layout.css";

function Layout() {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");

  return (
    <div className="app-container">
      <Navbar isMenuOpen={open} setOpen={setOpen} search={search} setSearch={setSearch} />
      <div className="layout">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <main className={`content ${open ? "shift" : ""}`}>
          <Outlet context={{ search }} />
        </main>
      </div>
    </div>
  );
}

export default Layout;
