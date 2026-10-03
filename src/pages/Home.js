import { useNavigate } from "react-router-dom";
import { FiArrowUpRight, FiBookOpen } from "react-icons/fi";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="home">
      <header className="home-header">
        <span className="home-brand">BIBLIOTHECA<span>.</span></span>
        <button type="button" className="home-catalogue-link" onClick={() => navigate("/books")}>
          Browse catalogue <FiArrowUpRight aria-hidden="true" />
        </button>
      </header>
      <div className="home-shade" />
      <section className="home-content">
        <p className="home-eyebrow"><span /> Your digital reading room</p>
        <h1>Stories wait.<br /><em>Start anywhere.</em></h1>
        <p className="home-intro">Borrow physical books, settle in with a digital read, and keep every chapter close.</p>
        <div className="home-buttons">
          <button type="button" className="home-primary" onClick={() => navigate("/login")}>Enter the library <FiArrowUpRight aria-hidden="true" /></button>
          <button type="button" className="home-secondary" onClick={() => navigate("/register")}>Create an account</button>
        </div>
      </section>
      <footer className="home-footer">
        <span>01 / 01</span>
        <span className="home-footer-line" />
        <span>Library management, made human</span>
        <FiBookOpen aria-hidden="true" />
      </footer>
    </main>
  );
}

export default Home;
