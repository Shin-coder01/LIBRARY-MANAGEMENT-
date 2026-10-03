import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowUpRight, FiBookOpen, FiCheck, FiHeart, FiRotateCcw } from "react-icons/fi";
import PointillistScene from "../Components/PointillistScene";
import { bookApi } from "../books/bookApi";
import { readStorage, writeStorage } from "../common/storage";
import "./MyLibrary.css";

function MyLibrary() {
  const navigate = useNavigate();
  const user = readStorage("user", {});
  const [books, setBooks] = useState([]);
  const [reading, setReading] = useState([]);
  const [borrowed, setBorrowed] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [returning, setReturning] = useState(null);

  const refreshLocal = useCallback(() => {
    const virtual = readStorage("virtualBooks", {});
    const allBorrowed = readStorage("borrowedBooks", []);
    const email = user.email?.toLowerCase();
    const owned = allBorrowed.filter((item) => typeof item.userEmail !== "string" || !email || item.userEmail.toLowerCase() === email);
    const now = Date.now();
    setReading(Object.entries(virtual).map(([title, value]) => ({
      title,
      start: value.start,
      daysLeft: Math.max(0, 15 - Math.floor((now - value.start) / 86400000))
    })));
    setBorrowed(owned.map((item) => ({
      ...item,
      daysLeft: Math.max(0, 90 - Math.floor((now - item.start) / 86400000))
    })));
    setFavorites(readStorage("favorites", []));
  }, [user.email]);

  useEffect(() => {
    refreshLocal();
    let active = true;
    bookApi.list()
      .then((data) => active && setBooks(data))
      .catch(() => active && setError("Book covers and stock need the catalogue server. Your saved reading list is still available."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [refreshLocal]);

  const bookFor = useCallback((item) => books.find((book) => book.id === item.id || book.title === item.title), [books]);
  const readingRows = useMemo(() => reading.map((item) => ({ ...item, book: bookFor(item) })), [reading, bookFor]);
  const borrowedRows = useMemo(() => borrowed.map((item) => ({ ...item, book: bookFor(item) })), [borrowed, bookFor]);
  const favoriteRows = useMemo(() => favorites.map((item) => ({ ...item, book: bookFor(item) || item })), [favorites, bookFor]);

  const returnBook = async (loan) => {
    const book = bookFor(loan);
    if (!book) {
      setError("This loan's catalogue record could not be found. Ask a librarian to return it.");
      return;
    }
    setReturning(loan.id || loan.title);
    setError("");
    try {
      const updated = { ...book, available: Math.min(Number(book.total || 0), Number(book.available || 0) + 1) };
      await bookApi.update(book.id, updated);
      setBooks((current) => current.map((item) => item.id === book.id ? updated : item));
      const allBorrowed = readStorage("borrowedBooks", []);
      const remaining = allBorrowed.filter((item) => !(item.title === loan.title && item.start === loan.start && item.userEmail === loan.userEmail));
      writeStorage("borrowedBooks", remaining);
      const issued = readStorage("issuedBooks", []);
      writeStorage("issuedBooks", issued.filter((item) => !(item.bookId === book.id && (!loan.userEmail || item.userEmail === loan.userEmail))));
      setNotice(`"${loan.title}" has been returned to the shelf.`);
      refreshLocal();
    } catch {
      setError("The return couldn't be recorded. Check the catalogue server and try again.");
    } finally {
      setReturning(null);
    }
  };

  const removeFavorite = (title) => {
    const next = readStorage("favorites", []).filter((item) => item.title !== title);
    writeStorage("favorites", next);
    setFavorites(next);
    setNotice(`Removed "${title}" from your saved shelf.`);
  };

  const renderRow = (item, kind) => {
    const book = item.book;
    const cover = book?.image;
    const action = kind === "reading"
      ? { label: item.daysLeft > 0 ? "Continue reading" : "Renew reading pass", icon: FiArrowUpRight, onClick: () => navigate(item.daysLeft > 0 ? `/reader/${encodeURIComponent(item.title)}` : `/payment/${encodeURIComponent(item.title)}`) }
      : kind === "borrowed"
        ? { label: returning === (item.id || item.title) ? "Returning..." : "Return book", icon: FiRotateCcw, onClick: () => returnBook(item), disabled: returning === (item.id || item.title) }
        : { label: "Remove saved book", icon: FiHeart, onClick: () => removeFavorite(item.title) };
    const Icon = action.icon;
    return (
      <article className="library-row" key={`${kind}-${item.id || item.title}-${item.start || ""}`}>
        <div className="library-cover">{cover ? <img src={cover} alt={`Cover of ${item.title}`} /> : <FiBookOpen aria-hidden="true" />}</div>
        <div className="library-book-info">
          <p>{item.author || book?.author || "Your bookshelf"}</p>
          <h3>{item.title}</h3>
          {kind === "reading" && <span className={item.daysLeft === 0 ? "status-expired" : ""}>{item.daysLeft > 0 ? `${item.daysLeft} days left in your reading pass` : "Reading pass ended"}</span>}
          {kind === "borrowed" && <span className={item.daysLeft === 0 ? "status-expired" : ""}>{item.daysLeft > 0 ? `${item.daysLeft} days until due` : "Due date passed"}</span>}
          {kind === "favorites" && <span>{book?.category || "Saved for later"}</span>}
        </div>
        <button type="button" className={`library-row-action ${kind === "favorites" ? "quiet" : ""}`} onClick={action.onClick} disabled={action.disabled} aria-label={`${action.label}: ${item.title}`}>
          <span>{action.label}</span><Icon aria-hidden="true" />
        </button>
      </article>
    );
  };

  const sections = [
    { id: "reading", title: "In progress", count: readingRows.length, rows: readingRows, empty: "Your next digital read is waiting on the catalogue.", kind: "reading" },
    { id: "borrowed", title: "On loan", count: borrowedRows.length, rows: borrowedRows, empty: "No print books are checked out right now.", kind: "borrowed" },
    { id: "favorites", title: "Saved for later", count: favoriteRows.length, rows: favoriteRows, empty: "Save a title from the catalogue and it will be here.", kind: "favorites" }
  ];

  return (
    <div className="my-library-page">
      <header className="my-library-heading pointillist-host">
        <PointillistScene variant="books" className="pointillist-scene--soft" />
        <div>
          <p className="dashboard-kicker">Your personal shelves</p>
          <h1>A place to pick<br /><em>up the story.</em></h1>
          <p>Reading, returns, and saved titles, all gathered in one quiet corner.</p>
        </div>
        <div className="library-counts" aria-label="Your library totals">
          <div><strong>{reading.length}</strong><span>reading</span></div>
          <div><strong>{borrowed.length}</strong><span>on loan</span></div>
          <div><strong>{favorites.length}</strong><span>saved</span></div>
        </div>
      </header>

      {notice && <p className="library-notice" role="status"><FiCheck aria-hidden="true" />{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></p>}
      {error && <p className="library-error" role="alert">{error}</p>}

      <nav className="library-jump-links" aria-label="My library sections">
        {sections.map((section) => <a key={section.id} href={`#${section.id}`}><span>{section.title}</span><strong>{section.count}</strong></a>)}
      </nav>

      {sections.map((section) => (
        <section className="library-section" id={section.id} key={section.id} aria-labelledby={`${section.id}-heading`}>
          <header><div><p className="dashboard-kicker">{section.kind === "reading" ? "Digital" : section.kind === "borrowed" ? "Print" : "Your list"}</p><h2 id={`${section.id}-heading`}>{section.title}</h2></div><span>{String(section.count).padStart(2, "0")} titles</span></header>
          {section.rows.length ? <div className="library-list">{section.rows.map((item) => renderRow(item, section.kind))}</div> : <div className="library-empty"><p>{loading && section.kind !== "reading" ? "Loading your shelf..." : section.empty}</p><button type="button" onClick={() => navigate("/books")}>Explore the catalogue <FiArrowUpRight aria-hidden="true" /></button></div>}
        </section>
      ))}
    </div>
  );
}

export default MyLibrary;
