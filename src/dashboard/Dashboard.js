import "./Dashboard.css";
import { useEffect, useState } from "react";

function Dashboard() {

  const [totalBooks, setTotalBooks] = useState(0);
  const [issuedBooks, setIssuedBooks] = useState(0);
  const [users, setUsers] = useState(0);

  useEffect(() => {

    const books = JSON.parse(localStorage.getItem("books")) || [];
    const issued = JSON.parse(localStorage.getItem("virtualBooks")) || {};
    const usersData = JSON.parse(localStorage.getItem("users")) || [];

    setTotalBooks(books.length);
    setIssuedBooks(Object.keys(issued).length);
    setUsers(usersData.length);

  }, []);

  const availableBooks = totalBooks - issuedBooks;

  return (
    <div className="dashboard-page">

      <h1 className="dashboard-title">Dashboard</h1>

      <div className="cards">

        <div className="card">
          <h3>Total Books</h3>
          <p>{totalBooks}</p>
        </div>

        <div className="card">
          <h3>Issued Books</h3>
          <p>{issuedBooks}</p>
        </div>

        <div className="card">
          <h3>Available Books</h3>
          <p>{availableBooks}</p>
        </div>

        <div className="card">
          <h3>Total Users</h3>
          <p>{users}</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;