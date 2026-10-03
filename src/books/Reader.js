import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiMinus, FiPlus, FiSun } from "react-icons/fi";
import PointillistScene from "../Components/PointillistScene";
import { bookApi } from "./bookApi";
import { readStorage, writeStorage } from "../common/storage";
import "./Reader.css";

const decodeTitle = (value) => {
  try { return decodeURIComponent(value); } catch { return value; }
};

function Reader() {
  const { title: routeTitle } = useParams();
  const title = decodeTitle(routeTitle || "");
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [daysLeft, setDaysLeft] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [progress, setProgress] = useState(() => readStorage("readingProgress", {})[title] || 0);
  const [focusMode, setFocusMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const virtual = readStorage("virtualBooks", {});
    const paid = readStorage("paidBooks", {});
    const session = virtual[title];
    const legacyPaid = Array.isArray(paid) && paid.includes(title);
    const paidStart = Number(Array.isArray(paid) ? NaN : paid[title]?.start || paid[title]);
    const validPaid = Number.isFinite(paidStart) && Date.now() - paidStart < 15 * 86400000;
    const hasPaidAccess = legacyPaid || validPaid;
    const accessStart = validPaid ? paidStart : session?.start;
    const remaining = accessStart ? 15 - Math.floor((Date.now() - accessStart) / 86400000) : 0;

    if (!hasPaidAccess && !session) {
      navigate("/books", { replace: true });
      return;
    }
    if (!hasPaidAccess && remaining <= 0) {
      navigate(`/payment/${encodeURIComponent(title)}`, { replace: true });
      return;
    }

    setDaysLeft(Math.max(0, remaining));
    let active = true;
    bookApi.list()
      .then((items) => {
        if (active) setBook(items.find((item) => item.title === title) || null);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [navigate, title]);

  const saveProgress = (event) => {
    const element = event.currentTarget;
    const range = element.scrollHeight - element.clientHeight;
    const nextProgress = range > 0 ? Math.round((element.scrollTop / range) * 100) : 0;
    setProgress(nextProgress);
    const saved = readStorage("readingProgress", {});
    saved[title] = nextProgress;
    writeStorage("readingProgress", saved);
  };

  const paragraphs = (book?.content || "").trim().split(/\n\s*\n/).filter(Boolean);

  return (
    <div className={`reader-page ${focusMode ? "focus-mode" : ""}`}>
      <div className="reader-topline">
        <Link to="/my-library"><FiArrowLeft aria-hidden="true" /> My library</Link>
        <span>Digital reading room</span>
      </div>

      <header className="reader-heading pointillist-host">
        <PointillistScene variant="quiet" className="pointillist-scene--soft" />
        <div>
          <p className="dashboard-kicker">Reading session {daysLeft > 0 ? ` / ${daysLeft} days remaining` : " / demo access"}</p>
          <h1>{title}</h1>
          <p>{book?.author || "A book from your digital shelf"}</p>
        </div>
        <div className="reader-progress-wrap">
          <div className="reader-progress-label"><span>Saved progress</span><strong>{progress}%</strong></div>
          <div className="reader-progress" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"><i style={{ width: `${progress}%` }} /></div>
        </div>
      </header>

      <div className="reader-layout">
        <aside className="reader-book-aside">
          <div className="reader-cover">{book?.image ? <img src={book.image} alt={`Cover of ${title}`} /> : <FiBookOpen aria-hidden="true" />}</div>
          <p>{book?.category || "Digital edition"}</p>
          <span>{loading ? "Loading title details" : book?.type === "virtual" ? "Digital book" : "Library title"}</span>
        </aside>

        <section className="reader-main" aria-label="Book text">
          <div className="reader-toolbar">
            <span><FiSun aria-hidden="true" /> Reading view</span>
            <div className="reader-controls">
              <button type="button" title="Decrease text size" aria-label="Decrease text size" disabled={fontSize <= 15} onClick={() => setFontSize((size) => Math.max(15, size - 1))}><FiMinus /></button>
              <span>{fontSize}px</span>
              <button type="button" title="Increase text size" aria-label="Increase text size" disabled={fontSize >= 24} onClick={() => setFontSize((size) => Math.min(24, size + 1))}><FiPlus /></button>
              <button type="button" className={focusMode ? "active" : ""} title={focusMode ? "Exit focus view" : "Enter focus view"} aria-label={focusMode ? "Exit focus view" : "Enter focus view"} aria-pressed={focusMode} onClick={() => setFocusMode((value) => !value)}><FiBookOpen /></button>
            </div>
          </div>

          {paragraphs.length ? (
            <article className="reader-text" onScroll={saveProgress} style={{ fontSize: `${fontSize}px` }}>
              <p className="reader-opening">{paragraphs[0]}</p>
              {paragraphs.slice(1).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              {progress === 100 && <p className="reader-finish">You reached the end of this selection.</p>}
            </article>
          ) : (
            <div className="reader-empty">
              <p className="dashboard-kicker">Text not attached</p>
              <h2>This digital title is waiting for its pages.</h2>
              <p>A librarian can add authorized reading text from the book editor. Once it’s attached, it will appear here with your saved reading progress.</p>
              <Link to="/books">Back to the catalogue <FiArrowLeft aria-hidden="true" /></Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Reader;
