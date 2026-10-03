import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight, FiImage, FiUpload } from "react-icons/fi";
import PointillistScene from "../Components/PointillistScene";
import { bookApi } from "./bookApi";
import { readStorage } from "../common/storage";
import "./AddEditBook.css";

const categories = ["Adventure", "Business", "Classic", "Fantasy", "Finance", "Mystery", "Romance", "Sci-Fi", "Self Help"];

function AddEditBook() {
  const user = readStorage("user", {});
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== undefined;
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("physical");
  const [image, setImage] = useState("");
  const [total, setTotal] = useState("1");
  const [content, setContent] = useState("");
  const [existingBook, setExistingBook] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    bookApi.get(id)
      .then((book) => {
        if (!active) return;
        setExistingBook(book);
        setTitle(book.title || "");
        setAuthor(book.author || "");
        setCategory(book.category || "");
        setType(book.type || "physical");
        setImage(book.image || "");
        setTotal(String(book.total || 1));
        setContent(book.content || "");
      })
      .catch(() => active && setError("This book could not be loaded. Return to the catalogue and try again."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, isEdit]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for the cover.");
      return;
    }
    if (file.size > 1_400_000) {
      setError("Choose a cover image smaller than 1.4 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result || ""));
      setError("");
    };
    reader.onerror = () => setError("We couldn't read that image. Please choose another file.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (type === "physical" && (!Number.isInteger(Number(total)) || Number(total) < 1)) {
      setError("Add a whole number of at least one copy.");
      return;
    }

    const copyTotal = type === "physical" ? Number(total) : 0;
    const checkedOut = existingBook?.type === "physical"
      ? Math.max(0, Number(existingBook.total || 0) - Number(existingBook.available || 0))
      : 0;
    const book = {
      ...(existingBook || {}),
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      type,
      image: image.trim(),
      content: type === "virtual" ? content.trim() : "",
      total: copyTotal,
      available: type === "physical" ? Math.max(0, copyTotal - checkedOut) : 0
    };

    setSaving(true);
    try {
      if (isEdit) await bookApi.update(id, book);
      else await bookApi.create(book);
      navigate("/books");
    } catch {
      setError("The book couldn't be saved. Check that the library server is running and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (user.role !== "admin") {
    return <div className="book-editor-state"><p>Staff access is required to manage the catalogue.</p><Link to="/books">Return to books</Link></div>;
  }
  if (loading) return <div className="book-editor-state"><span className="loading-mark" /><p>Loading book details</p></div>;
  if (isEdit && error && !existingBook) {
    return <div className="book-editor-state"><p role="alert">{error}</p><Link to="/books">Return to catalogue</Link></div>;
  }

  return (
    <div className="book-editor-page">
      <div className="book-editor-topline">
        <Link to="/books" className="editor-back"><FiArrowLeft aria-hidden="true" /> Catalogue</Link>
        <span>Staff workspace / {isEdit ? "Edit title" : "New title"}</span>
      </div>

      <header className="book-editor-heading pointillist-host">
        <PointillistScene variant="books" className="pointillist-scene--soft" />
        <div>
          <p className="dashboard-kicker">Catalogue management</p>
          <h1>{isEdit ? "Shape the details." : "Add a new title."}</h1>
          <p>{isEdit ? "Keep the shelf record accurate for every reader." : "Give readers a clear way into this book."}</p>
        </div>
        <div className="editor-index">{isEdit ? "02" : "01"}<span> / BOOK</span></div>
      </header>

      <form className="book-editor-form" onSubmit={handleSubmit}>
        <section className="editor-fields" aria-label="Book information">
          <div className="editor-section-heading"><span>01</span><h2>Book details</h2></div>
          <label htmlFor="book-title">Title</label>
          <input id="book-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} />

          <label htmlFor="book-author">Author</label>
          <input id="book-author" value={author} onChange={(event) => setAuthor(event.target.value)} required maxLength={120} />

          <label htmlFor="book-category">Category</label>
          <input id="book-category" list="book-category-options" value={category} onChange={(event) => setCategory(event.target.value)} required maxLength={60} />
          <datalist id="book-category-options">{categories.map((item) => <option key={item} value={item} />)}</datalist>

          <span className="editor-field-label">Format</span>
          <div className="format-switch" role="radiogroup" aria-label="Book format">
            <label className={type === "physical" ? "selected" : ""}><input type="radio" name="book-type" value="physical" checked={type === "physical"} onChange={() => setType("physical")} />Print</label>
            <label className={type === "virtual" ? "selected" : ""}><input type="radio" name="book-type" value="virtual" checked={type === "virtual"} onChange={() => setType("virtual")} />Digital</label>
          </div>

          {type === "physical" && (
            <>
              <label htmlFor="book-total">Total copies</label>
              <input id="book-total" type="number" min="1" step="1" value={total} onChange={(event) => setTotal(event.target.value)} required />
              {existingBook?.type === "physical" && <p className="editor-hint">{Math.max(0, existingBook.total - existingBook.available)} currently on loan. Those loans are preserved.</p>}
            </>
          )}
        </section>

        <aside className="editor-aside">
          <div className="editor-section-heading"><span>02</span><h2>Cover &amp; reading</h2></div>
          <div className="cover-preview">
            {image ? <img src={image} alt="Book cover preview" /> : <div className="cover-placeholder"><FiImage aria-hidden="true" /><span>Cover preview</span></div>}
          </div>
          <label htmlFor="book-image-url">Cover image URL</label>
          <input id="book-image-url" type="url" value={image.startsWith("data:") ? "" : image} placeholder="https://..." onChange={(event) => setImage(event.target.value)} />
          <label className="upload-control" htmlFor="book-image-file"><FiUpload aria-hidden="true" /> Upload cover image</label>
          <input className="visually-hidden" id="book-image-file" type="file" accept="image/*" onChange={handleImageUpload} />

          {type === "virtual" && (
            <>
              <label htmlFor="book-content">Digital reading text</label>
              <textarea id="book-content" className="book-content-input" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Paste authorized text or a reading excerpt. Separate paragraphs with a blank line." />
              <p className="editor-hint">Readers see this text in the built-in reading view.</p>
            </>
          )}
        </aside>

        {error && <p className="editor-error" role="alert">{error}</p>}
        <footer className="editor-actions">
          <button type="button" className="editor-cancel" onClick={() => navigate("/books")}>Cancel</button>
          <button type="submit" className="editor-save" disabled={saving}>{saving ? "Saving..." : isEdit ? "Save changes" : "Add to catalogue"}<FiArrowUpRight aria-hidden="true" /></button>
        </footer>
      </form>
    </div>
  );
}

export default AddEditBook;
