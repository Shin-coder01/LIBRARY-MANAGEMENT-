import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiBookOpen } from "react-icons/fi";
import PointillistScene from "../Components/PointillistScene";
import "./Home.css";

const readingWorlds = [
  { category: "Adventure", title: "Beyond the familiar", line: "A path into the unknown.", variant: "grove" },
  { category: "Mystery", title: "Follow the clues", line: "Every detail has a story.", variant: "circuit" },
  { category: "Romance", title: "A softer kind of wonder", line: "Some stories stay with us.", variant: "city" },
  { category: "Fantasy", title: "Worlds between pages", line: "Step somewhere impossible.", variant: "books" },
  { category: "Sci-Fi", title: "A little further ahead", line: "Imagine what comes next.", variant: "circuit" },
  { category: "Classic", title: "Stories that remain", line: "Return to a lasting voice.", variant: "quiet" }
];

function Home() {
  const navigate = useNavigate();
  const [worldIndex, setWorldIndex] = useState(0);
  const world = readingWorlds[worldIndex];

  useEffect(() => {
    const move = (event) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName) || event.target.isContentEditable) return;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        setWorldIndex((index) => (index + 1) % readingWorlds.length);
      }
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        setWorldIndex((index) => (index + readingWorlds.length - 1) % readingWorlds.length);
      }
    };
    window.addEventListener("keydown", move);
    return () => window.removeEventListener("keydown", move);
  }, []);

  const openWorld = () => navigate("/books", { state: { category: world.category } });

  return (
    <main className="home pointillist-host">
      <PointillistScene variant={world.variant} progress={worldIndex / (readingWorlds.length - 1)} />
      <header className="home-header">
        <span className="home-brand">BIBLIOTHECA<span>.</span></span>
        <button type="button" className="home-catalogue-link" onClick={() => navigate("/books")}>
          All books <FiArrowUpRight aria-hidden="true" />
        </button>
      </header>
      <section className="home-content">
        <p className="home-eyebrow"><span /> Reading world {String(worldIndex + 1).padStart(2, "0")} / 06 <i /></p>
        <h1>{world.title}<br /><em>{world.category}.</em></h1>
        <p className="home-intro">{world.line} Browse the collection, borrow a print edition, or settle in with a digital read.</p>
        <div className="home-buttons">
          <button type="button" className="home-primary" onClick={openWorld}>Explore {world.category} <FiArrowUpRight aria-hidden="true" /></button>
          <button type="button" className="home-secondary" onClick={() => navigate("/login")}>Sign in</button>
        </div>
      </section>
      <nav className="home-world-nav" aria-label="Choose a reading world">
        <button type="button" className="home-world-arrow" aria-label="Previous reading world" onClick={() => setWorldIndex((index) => (index + readingWorlds.length - 1) % readingWorlds.length)}><FiArrowLeft aria-hidden="true" /></button>
        {readingWorlds.map((item, index) => (
          <button type="button" key={item.category} className={`home-world-stop ${index === worldIndex ? "active" : ""}`} aria-current={index === worldIndex ? "step" : undefined} aria-label={`Reading world ${index + 1}: ${item.category}`} title={item.category} onClick={() => setWorldIndex(index)}>
            <span aria-hidden="true" />{item.category}
          </button>
        ))}
        <button type="button" className="home-world-arrow" aria-label="Next reading world" onClick={() => setWorldIndex((index) => (index + 1) % readingWorlds.length)}><FiArrowRight aria-hidden="true" /></button>
      </nav>
      <footer className="home-footer">
        <span>Move between worlds</span>
        <span className="home-footer-line" />
        <span>Stories wait. Start anywhere.</span>
        <FiBookOpen aria-hidden="true" />
      </footer>
    </main>
  );
}

export default Home;
