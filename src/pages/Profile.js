import { useNavigate } from "react-router-dom";
import { FiArrowUpRight, FiBookOpen, FiHeart, FiLogOut, FiUser } from "react-icons/fi";
import PointillistScene from "../Components/PointillistScene";
import { readStorage } from "../common/storage";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const user = readStorage("user", {});
  const email = user.email?.toLowerCase();
  const allBorrowed = readStorage("borrowedBooks", []);
  const borrowed = (Array.isArray(allBorrowed) ? allBorrowed : []).filter((item) => typeof item.userEmail !== "string" || !email || item.userEmail.toLowerCase() === email);
  const storedFavorites = readStorage("favorites", []);
  const favorites = Array.isArray(storedFavorites) ? storedFavorites : [];
  const initials = (user.name || user.email || "R").split(/[\s@]/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <header className="profile-heading">
        <div>
          <p className="dashboard-kicker">Reader account</p>
          <h1>Your profile.</h1>
          <p>Account details and the books close to you.</p>
        </div>
        <button type="button" className="profile-signout" onClick={logout}><FiLogOut aria-hidden="true" /> Sign out</button>
      </header>

      <section className="profile-overview" aria-labelledby="profile-name">
        <div className="profile-avatar" aria-hidden="true">{initials || "R"}</div>
        <div className="profile-identity">
          <span className="profile-role"><FiUser aria-hidden="true" /> {user.role || "Reader"}</span>
          <h2 id="profile-name">{user.name || "Library reader"}</h2>
          <p>{user.email || "No email on file"}</p>
        </div>
        <div className="profile-totals">
          <div><strong>{borrowed.length}</strong><span>books on loan</span></div>
          <div><strong>{favorites.length}</strong><span>saved titles</span></div>
        </div>
      </section>

      <div className="profile-columns">
        <section className="profile-details" aria-labelledby="account-details-heading">
          <header><p className="dashboard-kicker">Your record</p><h2 id="account-details-heading">Account details</h2></header>
          <dl>
            <div><dt>Full name</dt><dd>{user.name || "Not provided"}</dd></div>
            <div><dt>Email address</dt><dd>{user.email || "Not provided"}</dd></div>
            <div><dt>Account type</dt><dd>{user.role || "Reader"}</dd></div>
            {user.role === "student" && <>
              <div><dt>Student ID</dt><dd>{user.studentId || "Not provided"}</dd></div>
              <div><dt>Department</dt><dd>{user.department || "Not provided"}</dd></div>
            </>}
          </dl>
        </section>

        <aside className="profile-reading-note pointillist-host">
          <PointillistScene variant="quiet" className="pointillist-scene--soft" />
          <div className="profile-note-icon"><FiBookOpen aria-hidden="true" /></div>
          <p className="dashboard-kicker">Your next chapter</p>
          <h2>Keep the good stories close.</h2>
          <p>Continue a digital book, return a print copy, or find something new for your shelf.</p>
          <button type="button" onClick={() => navigate("/my-library")}>Open my library <FiArrowUpRight aria-hidden="true" /></button>
        </aside>
      </div>

      <section className="profile-saved" aria-labelledby="profile-saved-heading">
        <header><div><p className="dashboard-kicker"><FiHeart aria-hidden="true" /> Saved shelf</p><h2 id="profile-saved-heading">A few for later</h2></div><button type="button" onClick={() => navigate("/my-library")}>View all <FiArrowUpRight aria-hidden="true" /></button></header>
        {favorites.length ? (
          <div className="profile-favorite-list">
            {favorites.slice(0, 4).map((book, index) => (
              <div key={book.id || `${book.title}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p><strong>{book.title}</strong><small>{book.author || "Unknown author"}</small></p><FiHeart aria-hidden="true" /></div>
            ))}
          </div>
        ) : (
          <div className="profile-no-favorites"><p>Titles you save from the catalogue will appear here.</p><button type="button" onClick={() => navigate("/books")}>Browse the catalogue <FiArrowUpRight aria-hidden="true" /></button></div>
        )}
      </section>
    </div>
  );
}

export default Profile;
