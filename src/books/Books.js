import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { FiArrowUpRight, FiBookOpen, FiCheck, FiEdit3, FiHeart, FiRefreshCw } from "react-icons/fi";
import PointillistScene from "../Components/PointillistScene";
import { bookApi } from "./bookApi";
import "./Books.css";

const categories = ["Romance", "Adventure", "Mystery", "Self Help", "Fantasy", "Sci-Fi", "Business", "Classic", "Finance"];
const readingWorlds = ["Adventure", "Mystery", "Romance", "Fantasy", "Sci-Fi", "Classic"];

const readStoredValue = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

function Books() {
  const { search = "" } = useOutletContext() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const user = readStoredValue("user", {});
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState(location.state?.category || "All");
  const [favorites, setFavorites] = useState(() => readStoredValue("favorites", []));
  const [notice, setNotice] = useState("");
  const [borrowingId, setBorrowingId] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setBooks(await bookApi.list());
    } catch {
      setError("The catalogue could not be reached. Start the library server and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter((book) => {
      const matchesSearch = !query || [book.title, book.author, book.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
      return matchesSearch && (activeCategory === "All" || book.category === activeCategory);
    });
  }, [activeCategory, books, search]);

  const orderedCategories = useMemo(() => {
    const discovered = books.map((book) => book.category).filter(Boolean);
    return [...new Set([...categories, ...discovered])].filter((category) =>
      filteredBooks.some((book) => book.category === category)
    );
  }, [books, filteredBooks]);

  const physicalCopies = books
    .filter((book) => book.type === "physical")
    .reduce((total, book) => total + Number(book.available || 0), 0);
  const digitalTitles = books.filter((book) => book.type === "virtual").length;
  const worldProgress = Math.max(0, readingWorlds.indexOf(activeCategory)) / (readingWorlds.length - 1);

  const isReading = (book) => Boolean(readStoredValue("virtualBooks", {})[book.title]);

  const getDaysLeft = (book) => {
    const started = readStoredValue("virtualBooks", {})[book.title]?.start;
    if (!started) return null;
    const elapsedDays = Math.floor((Date.now() - started) / (1000 * 60 * 60 * 24));
    return Math.max(0, 15 - elapsedDays);
  };

  const getBorrowDaysLeft = (book) => {
    const borrowed = readStoredValue("borrowedBooks", []);
    const found = borrowed.find((item) => item.id === book.id && (!item.userEmail || item.userEmail.toLowerCase() === user.email?.toLowerCase()));
    if (!found) return null;
    const elapsedDays = Math.floor((Date.now() - found.start) / (1000 * 60 * 60 * 24));
    return Math.max(0, 90 - elapsedDays);
  };

  const readBook = (book) => {
    const issued = readStoredValue("virtualBooks", {});
    const previous = issued[book.title];
    const expired = previous?.start && Date.now() - previous.start >= 15 * 86400000;
    issued[book.title] = !previous || expired ? { start: Date.now() } : previous;
    localStorage.setItem("virtualBooks", JSON.stringify(issued));
    navigate(`/reader/${encodeURIComponent(book.title)}`);
  };

  const checkoutBook = async (book) => {
    if (book.available <= 0 || borrowingId) return;
    setBorrowingId(book.id);
    try {
      const updatedBook = { ...book, available: book.available - 1 };
      await bookApi.update(book.id, updatedBook);
      setBooks((current) => current.map((item) => item.id === book.id ? updatedBook : item));
      const borrowed = readStoredValue("borrowedBooks", []);
      localStorage.setItem("borrowedBooks", JSON.stringify([...borrowed, {
        id: book.id,
        title: book.title,
        author: book.author,
        userEmail: user.email || "",
        student: user.name || "",
        start: Date.now()
      }]));
      setNotice(`"${book.title}" is now in your library.`);
    } catch {
      setNotice("We could not complete that checkout. Please try again.");
    } finally {
      setBorrowingId(null);
    }
  };

  const toggleFavorite = (book) => {
    const isSaved = favorites.some((item) => item.id === book.id || item.title === book.title);
    const next = isSaved
      ? favorites.filter((item) => item.id !== book.id && item.title !== book.title)
      : [...favorites, book];
    setFavorites(next);
    localStorage.setItem("favorites", JSON.stringify(next));
    setNotice(isSaved ? `Removed "${book.title}" from your saved shelf.` : `Saved "${book.title}" for later.`);
  };

  const actionFor = (book) => {
    if (book.type === "virtual") {
      if (isReading(book)) {
        const daysLeft = getDaysLeft(book);
        return daysLeft > 0
          ? { label: `Continue reading - ${daysLeft}d left`, onClick: () => navigate(`/reader/${encodeURIComponent(book.title)}`) }
          : user.role === "admin"
            ? { label: "Continue reading", onClick: () => readBook(book) }
            : { label: "Reading period ended", onClick: () => navigate(`/payment/${encodeURIComponent(book.title)}`), muted: true };
      }
      return { label: "Start reading", onClick: () => readBook(book) };
    }

    const daysLeft = getBorrowDaysLeft(book);
    if (daysLeft !== null) return { label: `On loan - ${daysLeft}d left`, disabled: true, muted: true };
    if (!["student", "admin"].includes(user.role)) return { label: "Sign in to borrow", onClick: () => navigate("/login"), muted: true };
    if (book.available <= 0) return { label: "All copies on loan", disabled: true, muted: true };
    return { label: borrowingId === book.id ? "Checking out..." : "Borrow this book", onClick: () => checkoutBook(book), disabled: borrowingId === book.id };
  };

  if (loading) {
    return <div className="books-state"><div className="loading-mark" /><p>Opening the catalogue</p></div>;
  }

  if (error) {
    return (
      <div className="books-state books-error">
        <p>{error}</p>
        <button type="button" className="text-action" onClick={fetchBooks}><FiRefreshCw /> Retry</button>
      </div>
    );
  }

  return (
    <div className="books-page">
      <section className="catalogue-intro pointillist-host" aria-labelledby="catalogue-heading">
        <PointillistScene variant="books" progress={worldProgress} />
        <div>
          <p className="eyebrow"><span /> Curated collection</p>
          <h1 id="catalogue-heading">Find a book.<br /><em>Keep the feeling.</em></h1>
          <p className="catalogue-copy">A considered collection for quiet afternoons, sharp questions, and everything in between.</p>
        </div>
        <div className="catalogue-summary" aria-label="Catalogue summary">
          <div><strong>{books.length}</strong><span>titles</span></div>
          <div><strong>{physicalCopies}</strong><span>copies ready</span></div>
          <div><strong>{digitalTitles}</strong><span>digital reads</span></div>
        </div>
      </section>

      <nav className="catalogue-worlds" aria-label="Browse reading worlds">
        <span>Travel by feeling</span>
        {readingWorlds.map((category, index) => (
          <button key={category} type="button" className={activeCategory === category ? "active" : ""} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>
            <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>{category}
          </button>
        ))}
      </nav>

      <section className="catalogue-controls" aria-label="Catalogue filters">
        <div className="catalogue-result">
          <span>Browse the shelves</span>
          <strong>{filteredBooks.length} {filteredBooks.length === 1 ? "result" : "results"}</strong>
        </div>
        <div className="category-tabs" role="tablist" aria-label="Filter by category">
          <button type="button" role="tab" aria-selected={activeCategory === "All"} className={activeCategory === "All" ? "active" : ""} onClick={() => setActiveCategory("All")}>All</button>
          {categories.filter((category) => books.some((book) => book.category === category)).map((category) => (
            <button key={category} type="button" role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>
          ))}
        </div>
      </section>

      {notice && (
        <div className="catalogue-notice" role="status">
          <FiCheck aria-hidden="true" />
          <span>{notice}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}>x</button>
        </div>
      )}

      {filteredBooks.length === 0 ? (
        <section className="catalogue-empty">
          <FiBookOpen aria-hidden="true" />
          <h2>No books on this shelf yet.</h2>
          <p>Try another search or browse the full catalogue.</p>
          <button type="button" className="text-action" onClick={() => setActiveCategory("All")}>Show all books <FiArrowUpRight /></button>
        </section>
      ) : (
        <div className="catalogue-shelves">
          {orderedCategories.map((category) => {
            const categoryBooks = filteredBooks.filter((book) => book.category === category);
            return (
              <section className="books-section" key={category} aria-labelledby={`category-${category}`}>
                <header className="shelf-heading">
                  <h2 id={`category-${category}`}>{category}</h2>
                  <span>{String(categoryBooks.length).padStart(2, "0")} titles</span>
                </header>
                <div className="book-row">
                  {categoryBooks.map((book, index) => {
                    const action = actionFor(book);
                    const isFavorite = favorites.some((item) => item.id === book.id || item.title === book.title);
                    return (
                      <article className="book-card" key={book.id || `${book.title}-${index}`}>
                        <div className="book-cover-wrap">
                          <img className="book-cover" src={book.image} alt={`Cover of ${book.title}`} />
                          <button
                            type="button"
                            className={`favorite-button ${isFavorite ? "saved" : ""}`}
                            aria-label={isFavorite ? `Remove ${book.title} from saved books` : `Save ${book.title}`}
                            aria-pressed={isFavorite}
                            title={isFavorite ? "Remove from saved books" : "Save for later"}
                            onClick={() => toggleFavorite(book)}
                          >
                            <FiHeart aria-hidden="true" />
                          </button>
                          <span className="book-format">{book.type === "physical" ? "Print" : "Digital"}</span>
                        </div>
                        <div className="book-details">
                          <p className="book-author">{book.author || "Unknown author"}</p>
                          <h3 title={book.title}>{book.title}</h3>
                          <p className="book-availability">
                            {book.type === "physical" ? `${book.available || 0} of ${book.total || 0} copies available` : "Read in your browser"}
                          </p>
                        </div>
                        <div className="book-actions">
                          <button type="button" className={`book-primary ${action.muted ? "muted" : ""}`} onClick={action.onClick} disabled={action.disabled}>
                            <span>{action.label}</span><FiArrowUpRight aria-hidden="true" />
                          </button>
                          {user.role === "admin" && (
                            <button type="button" className="book-edit" aria-label={`Edit ${book.title}`} title="Edit book" onClick={() => navigate(`/edit-book/${book.id}`)}>
                              <FiEdit3 aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Books;
