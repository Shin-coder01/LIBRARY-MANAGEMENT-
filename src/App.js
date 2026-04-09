import { Routes, Route } from "react-router-dom";

import Layout from "./Components/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyLibrary from "./pages/MyLibrary";
import Profile from "./pages/Profile";

import Dashboard from "./dashboard/Dashboard";

import Books from "./books/Books";
import AddEditBook from "./books/AddEditBook";
import IssueBook from "./issuebooks/Issuebook";
import Reader from "./books/Reader";
import Payment from "./books/Payment";

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Layout Routes */}
      <Route element={<Layout />}>

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />

        <Route path="/add-book" element={<AddEditBook />} />
        <Route path="/edit-book/:id" element={<AddEditBook />} />

        <Route path="/issue-book" element={<IssueBook />} />
        <Route path="/my-library" element={<MyLibrary />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/reader/:title" element={<Reader />} />
        <Route path="/payment/:title" element={<Payment />} />

      </Route>

    </Routes>
  );
}

export default App;