import axios from "axios";

const localHost = typeof window === "undefined"
  ? "localhost"
  : window.location.hostname.includes(":")
    ? `[${window.location.hostname}]`
    : window.location.hostname;

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === "production"
  ? ""
  : `${typeof window === "undefined" ? "http" : window.location.protocol}//${localHost}:8080/api`);

const api = axios.create({
  ...(apiBaseUrl ? { baseURL: apiBaseUrl } : {}),
  timeout: 5000
});

const starterBooks = [
  { title: "Failing Light", author: "Carter Woods", category: "Adventure", type: "physical", image: "https://m.media-amazon.com/images/I/81eB+7+CkUL.jpg", total: 2, available: 2 },
  { title: "The Long Blackout", author: "Robert J. Walker", category: "Mystery", type: "physical", image: "https://m.media-amazon.com/images/I/91HHqVTAJQL.jpg", total: 2, available: 2 },
  { title: "And Then He Pressed Play", author: "Robert Halliwell", category: "Romance", type: "physical", image: "https://m.media-amazon.com/images/I/81WcnNQ-TBL.jpg", total: 2, available: 2 },
  { title: "Atomic Habits", author: "James Clear", category: "Self Help", type: "virtual", image: "https://m.media-amazon.com/images/I/91bYsX41DVL.jpg" },
  { title: "The Alchemist", author: "Paulo Coelho", category: "Adventure", type: "physical", image: "https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg", total: 3, available: 3 },
  { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", category: "Finance", type: "physical", image: "https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg", total: 2, available: 2 },
  { title: "The Psychology of Money", author: "Morgan Housel", category: "Finance", type: "virtual", image: "https://m.media-amazon.com/images/I/71g2ednj0JL.jpg" },
  { title: "Harry Potter", author: "J.K. Rowling", category: "Fantasy", type: "virtual", image: "https://m.media-amazon.com/images/I/81YOuOGFCJL.jpg" },
  { title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fantasy", type: "physical", image: "https://m.media-amazon.com/images/I/91b0C2YNSrL.jpg", total: 2, available: 2 },
  { title: "The Notebook", author: "Nicholas Sparks", category: "Romance", type: "physical", image: "https://m.media-amazon.com/images/I/81bGKUa1e0L.jpg", total: 2, available: 2 },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Classic", type: "virtual", image: "https://m.media-amazon.com/images/I/81af+MCATTL.jpg" },
  { title: "1984", author: "George Orwell", category: "Classic", type: "physical", image: "https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg", total: 2, available: 2 },
  { title: "Animal Farm", author: "George Orwell", category: "Classic", type: "physical", image: "https://m.media-amazon.com/images/I/91VokXkn8hL.jpg", total: 2, available: 2 },
  { title: "The Power of Now", author: "Eckhart Tolle", category: "Self Help", type: "virtual", image: "https://m.media-amazon.com/images/I/71E8VNPC1dL.jpg" },
  { title: "Deep Work", author: "Cal Newport", category: "Self Help", type: "virtual", image: "https://m.media-amazon.com/images/I/71m-MxdJ2WL.jpg" },
  { title: "Zero to One", author: "Peter Thiel", category: "Business", type: "physical", image: "https://m.media-amazon.com/images/I/71uAI28kJuL.jpg", total: 2, available: 2 },
  { title: "The Lean Startup", author: "Eric Ries", category: "Business", type: "physical", image: "https://m.media-amazon.com/images/I/81-QB7nDh4L.jpg", total: 2, available: 2 },
  { title: "Ready Player One", author: "Ernest Cline", category: "Sci-Fi", type: "virtual", image: "https://m.media-amazon.com/images/I/81WcnNQ-TBL.jpg" },
  { title: "It Ends With Us", author: "Colleen Hoover", category: "Romance", type: "physical", image: "https://m.media-amazon.com/images/I/81s0B6NYXML.jpg", total: 2, available: 2 },
  { title: "Verity", author: "Colleen Hoover", category: "Romance", type: "virtual", image: "https://m.media-amazon.com/images/I/91dSMhdIzTL.jpg" }
];

let localMode = !apiBaseUrl;
const storageKey = "books";

function normalizeBook(book, index) {
  const physical = book.type !== "virtual";
  const total = physical ? Math.max(0, Number(book.total ?? 1) || 0) : 0;
  const available = physical ? Math.min(total, Math.max(0, Number(book.available ?? total) || 0)) : 0;
  return {
    ...book,
    id: book.id ?? `local-${index + 1}`,
    title: String(book.title || "Untitled"),
    author: String(book.author || ""),
    category: String(book.category || "Classic"),
    type: physical ? "physical" : "virtual",
    image: String(book.image || ""),
    total,
    available,
    content: String(book.content || "")
  };
}

function readLocalBooks() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw !== null) {
      const stored = JSON.parse(raw);
      if (Array.isArray(stored)) return stored.map(normalizeBook);
    }
  } catch {
    return null;
  }
  return null;
}

function saveLocalBooks(books) {
  const normalized = books.map(normalizeBook);
  try {
    localStorage.setItem(storageKey, JSON.stringify(normalized));
  } catch {
    // Keep the current interaction usable if browser storage is unavailable.
  }
  localMode = true;
  return normalized;
}

function getLocalBooks() {
  const stored = readLocalBooks();
  if (stored?.length) return stored;
  return saveLocalBooks(starterBooks);
}

function isNetworkFailure(error) {
  return !error?.response;
}

function findLocalBook(id) {
  const book = getLocalBooks().find((item) => String(item.id) === String(id));
  if (!book) throw new Error("This book is not in the saved catalogue.");
  return book;
}

function createLocalBook(book) {
  const books = getLocalBooks();
  const next = normalizeBook({ ...book, id: book.id || `local-${Date.now()}` }, books.length);
  saveLocalBooks([...books, next]);
  return next;
}

function updateLocalBook(id, book) {
  const books = getLocalBooks();
  const index = books.findIndex((item) => String(item.id) === String(id));
  if (index < 0) throw new Error("This book is not in the saved catalogue.");
  const next = normalizeBook({ ...books[index], ...book, id: books[index].id }, index);
  saveLocalBooks(books.map((item, itemIndex) => itemIndex === index ? next : item));
  return next;
}

export const bookApi = {
  isLocalMode() {
    return localMode;
  },
  canRetryServer() {
    return Boolean(apiBaseUrl);
  },
  async list() {
    if (!apiBaseUrl) {
      localMode = true;
      return getLocalBooks();
    }
    try {
      const response = await api.get("/books");
      const serverBooks = Array.isArray(response.data) ? response.data.map(normalizeBook) : [];
      const savedBooks = readLocalBooks();
      if (!serverBooks.length) {
        localMode = true;
        return savedBooks?.length ? savedBooks : saveLocalBooks(starterBooks);
      }
      localMode = false;
      try { localStorage.setItem(storageKey, JSON.stringify(serverBooks)); } catch { /* Cache is optional when the server is available. */ }
      return serverBooks;
    } catch {
      localMode = true;
      return getLocalBooks();
    }
  },
  async get(id) {
    if (localMode) return findLocalBook(id);
    try {
      const response = await api.get(`/books/${id}`);
      return normalizeBook(response.data, 0);
    } catch (error) {
      if (!isNetworkFailure(error)) throw error;
      localMode = true;
      return findLocalBook(id);
    }
  },
  async create(book) {
    if (localMode) return createLocalBook(book);
    try {
      const response = await api.post("/books", book);
      return normalizeBook(response.data, 0);
    } catch (error) {
      if (!isNetworkFailure(error)) throw error;
      localMode = true;
      return createLocalBook(book);
    }
  },
  async update(id, book) {
    if (localMode) return updateLocalBook(id, book);
    try {
      const response = await api.put(`/books/${id}`, book);
      return normalizeBook(response.data, 0);
    } catch (error) {
      if (!isNetworkFailure(error)) throw error;
      localMode = true;
      return updateLocalBook(id, book);
    }
  }
};
