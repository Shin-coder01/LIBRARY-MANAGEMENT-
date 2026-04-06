import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {

  const navigate = useNavigate();

  return (

    <div className="home">

     
      <div className="top-bar">
        <button
          className="explore-btn"
          onClick={() => navigate("/books")}
        >
          Explore Books
        </button>
      </div>

      <div className="home-overlay">

        <div className="home-content">

          <h1>Library Management System</h1>

          <p>
            Manage books, issue records, and your digital library easily.
          </p>

          <div className="home-buttons">

            <button
              className="home-btn"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>

            <button
              className="home-btn secondary"
              onClick={() => navigate("/register")}
            >
              Register
            </button>

          </div>

        </div>

      </div>

    </div>

  )

}

export default Home;