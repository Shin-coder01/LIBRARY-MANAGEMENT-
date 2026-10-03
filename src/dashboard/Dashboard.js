import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowUpRight, FiBookOpen, FiLayers, FiPlusCircle, FiUsers } from "react-icons/fi";
import PointillistScene from "../Components/PointillistScene";
import { bookApi } from "../books/bookApi";
import "./Dashboard.css";

const stored = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const user = stored("user", {});
  const [metrics, setMetrics] = useState({ titles: 0, available: 0, activeLoans: 0, members: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      const borrowed = stored("borrowedBooks", []);
      const digitalLoans = Object.keys(stored("virtualBooks", {})).length;
      const members = stored("users", []).length;
      try {
        const books = await bookApi.list();
        setMetrics({
          titles: books.length,
          available: books
            .filter((book) => book.type === "physical")
            .reduce((sum, book) => sum + Number(book.available || 0), 0),
          activeLoans: borrowed.length + digitalLoans,
          members
        });
      } catch {
        const books = stored("books", []);
        setMetrics({
          titles: books.length,
          available: books.reduce((sum, book) => sum + Number(book.available || 0), 0),
          activeLoans: borrowed.length + digitalLoans,
          members
        });
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  const stats = [
    { label: "Catalogued titles", value: metrics.titles, note: "Across every shelf", icon: FiBookOpen, tone: "blue" },
    { label: "Copies ready", value: metrics.available, note: "Available to borrow", icon: FiLayers, tone: "forest" },
    { label: "Active loans", value: metrics.activeLoans, note: "Print and digital", icon: FiArrowUpRight, tone: "coral" },
    { label: "Members", value: metrics.members, note: "Registered readers", icon: FiUsers, tone: "ink" }
  ];

  return (
    <div className="dashboard-page">
      <header className="dashboard-head">
        <div>
          <p className="dashboard-kicker">Library overview</p>
          <h1>Good to see you{user.name ? `, ${user.name.split(" ")[0]}` : ""}.</h1>
          <p className="dashboard-lead">Your collection, lending activity, and next reading choices in one place.</p>
        </div>
        <div className="dashboard-actions">
          <button type="button" className="dashboard-primary-action" onClick={() => navigate("/books")}>
            Browse catalogue <FiArrowUpRight aria-hidden="true" />
          </button>
          {user.role === "admin" && (
            <button type="button" className="dashboard-icon-action" title="Add a book" aria-label="Add a book" onClick={() => navigate("/add-book")}>
              <FiPlusCircle aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <section className="dashboard-stat-grid" aria-label="Library statistics">
        {stats.map(({ label, value, note, icon: Icon, tone }) => (
          <article className={`dashboard-stat ${tone}`} key={label}>
            <div className="stat-top"><span>{label}</span><Icon aria-hidden="true" /></div>
            <strong>{loading ? "--" : value}</strong>
            <p>{note}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-lower">
        <div className="dashboard-focus pointillist-host">
          <PointillistScene variant="circuit" className="pointillist-scene--soft" />
          <p className="dashboard-kicker">Reading room</p>
          <h2>The collection is ready when you are.</h2>
          <p>Discover an overlooked classic, begin a digital read, or keep a close eye on active loans.</p>
          <button type="button" onClick={() => navigate("/my-library")}>Open my library <FiArrowUpRight aria-hidden="true" /></button>
        </div>
        <section className="dashboard-loan-summary" aria-labelledby="loan-summary-heading">
          <div className="loan-summary-head">
            <div>
              <p className="dashboard-kicker">At a glance</p>
              <h2 id="loan-summary-heading">Loan activity</h2>
            </div>
            <span>{loading ? "--" : metrics.activeLoans} active</span>
          </div>
          <div className="loan-scale" aria-hidden="true">
            <i style={{ width: `${Math.min(100, Math.max(9, metrics.activeLoans * 14))}%` }} />
          </div>
          <p>Digital reading and physical loans are tracked together so the whole lending desk stays visible.</p>
          <button type="button" className="dashboard-text-link" onClick={() => navigate("/my-library")}>View loan details <FiArrowUpRight aria-hidden="true" /></button>
        </section>
      </section>
    </div>
  );
}

export default Dashboard;
