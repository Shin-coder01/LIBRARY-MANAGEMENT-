import { useCallback, useEffect, useState } from "react";
import { FiArrowUpRight, FiBookOpen, FiCheck, FiRefreshCw } from "react-icons/fi";
import PointillistScene from "../Components/PointillistScene";
import { bookApi } from "../books/bookApi";
import { readStorage, writeStorage } from "../common/storage";
import "./IssueBook.css";

function IssueBook() {
  const user = readStorage("user", {});
  const [books, setBooks] = useState([]);
  const [members] = useState(() => {
    const users = readStorage("users", []);
    return Array.isArray(users) ? users.filter((item) => item.role === "student") : [];
  });
  const [issuedBooks, setIssuedBooks] = useState(() => readStorage("issuedBooks", []));
  const [student, setStudent] = useState("");
  const [bookId, setBookId] = useState("");
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setBooks(await bookApi.list());
    } catch {
      setError("The catalogue server could not be reached. Start it and retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  if (user.role !== "admin") {
    return <div className="issue-state"><h1>Staff access required</h1><p>The issue desk is available to library administrators.</p></div>;
  }

  const availableBooks = books.filter((item) => item.type === "physical" && Number(item.available) > 0);
  const selectedBook = books.find((item) => String(item.id) === bookId);

  const issueBook = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const selectedMember = members.find((item) => item.name?.toLowerCase() === student.trim().toLowerCase() || item.email?.toLowerCase() === student.trim().toLowerCase());
    if (!selectedBook || !selectedMember) {
      setError(!selectedMember ? "Choose a registered student from the suggestions." : "Choose an available physical book.");
      return;
    }
    setIssuing(true);
    try {
      const updatedBook = await bookApi.update(selectedBook.id, {
        ...selectedBook,
        available: Number(selectedBook.available) - 1
      });
      const now = Date.now();
      const loan = {
        id: `${selectedBook.id}-${now}`,
        bookId: selectedBook.id,
        title: selectedBook.title,
        author: selectedBook.author,
        student: selectedMember.name,
        userEmail: selectedMember.email,
        start: now,
        date: new Date(now).toLocaleDateString()
      };
      const nextBorrowed = [...readStorage("borrowedBooks", []), loan];
      const nextIssued = [...issuedBooks, loan];
      writeStorage("borrowedBooks", nextBorrowed);
      writeStorage("issuedBooks", nextIssued);
      setBooks((current) => current.map((item) => item.id === updatedBook.id ? updatedBook : item));
      setIssuedBooks(nextIssued);
      setStudent("");
      setBookId("");
      setNotice(`${selectedBook.title} issued to ${selectedMember.name}.`);
    } catch {
      setError("The loan could not be recorded. Please retry; inventory has not been changed locally.");
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="issue-page">
      <header className="issue-heading pointillist-host">
        <PointillistScene variant="circuit" className="pointillist-scene--soft" />
        <div>
          <p className="dashboard-kicker">Staff workspace / circulation</p>
          <h1>Issue desk.</h1>
          <p>Match a reader with an available copy and keep the lending record current.</p>
        </div>
        <div className="issue-available"><strong>{loading ? "--" : availableBooks.length}</strong><span>titles ready to lend</span></div>
      </header>

      <section className="issue-workflow" aria-labelledby="issue-workflow-heading">
        <div className="issue-form-intro"><span>01</span><div><h2 id="issue-workflow-heading">New loan</h2><p>The reader will see this book in their personal library.</p></div></div>
        <form onSubmit={issueBook} className="issue-form">
          <div>
            <label htmlFor="issue-student">Student</label>
            <input id="issue-student" list="issue-members" value={student} onChange={(event) => setStudent(event.target.value)} placeholder="Search by name or email" required />
            <datalist id="issue-members">{members.map((item) => <option key={item.email} value={item.name}>{item.email}</option>)}</datalist>
          </div>
          <div>
            <label htmlFor="issue-book">Available print title</label>
            <select id="issue-book" value={bookId} onChange={(event) => setBookId(event.target.value)} required disabled={loading || !availableBooks.length}>
              <option value="">{loading ? "Loading catalogue..." : availableBooks.length ? "Choose a book" : "No copies available"}</option>
              {availableBooks.map((item) => <option key={item.id} value={item.id}>{item.title} ({item.available} available)</option>)}
            </select>
          </div>
          <button type="submit" disabled={issuing || loading || !members.length || !availableBooks.length}>
            {issuing ? "Recording loan..." : "Issue this book"}<FiArrowUpRight aria-hidden="true" />
          </button>
        </form>
        {!members.length && <p className="issue-hint">Register a student account before issuing a book.</p>}
        {error && <p className="issue-feedback error" role="alert">{error}{error.startsWith("The catalogue") && <button type="button" onClick={loadBooks}><FiRefreshCw /> Retry</button>}</p>}
        {notice && <p className="issue-feedback success" role="status"><FiCheck aria-hidden="true" />{notice}</p>}
      </section>

      <section className="issue-records" aria-labelledby="issue-records-heading">
        <header><div><p className="dashboard-kicker">Circulation log</p><h2 id="issue-records-heading">Recent issues</h2></div><span>{String(issuedBooks.length).padStart(2, "0")} records</span></header>
        {issuedBooks.length ? (
          <div className="issue-table-wrap">
            <table className="issue-table">
              <thead><tr><th scope="col">Reader</th><th scope="col">Title</th><th scope="col">Issued</th><th scope="col">Status</th></tr></thead>
              <tbody>{[...issuedBooks].reverse().map((item, index) => (
                <tr key={item.id || `${item.book}-${item.date}-${index}`}>
                  <td><strong>{item.student}</strong><small>{item.userEmail}</small></td>
                  <td>{item.title || item.book}</td>
                  <td>{item.date}</td>
                  <td><span className="issue-status"><i /> On loan</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="issue-empty"><FiBookOpen aria-hidden="true" /><p>No books have been issued yet.</p></div>
        )}
      </section>
    </div>
  );
}

export default IssueBook;
