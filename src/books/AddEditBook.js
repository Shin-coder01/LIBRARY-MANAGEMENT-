import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AddEditBook.css";

function AddEditBook() {

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = id !== undefined;

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState("");
  const [total, setTotal] = useState("");

  // ✅ useEffect MUST be before any return
  useEffect(() => {

    if (isEdit) {
      const books = JSON.parse(localStorage.getItem("books")) || [];
      const book = books[id];

      if (!book) {
        navigate("/books");
        return;
      }

      setTitle(book.title);
      setAuthor(book.author);
      setCategory(book.category);
      setType(book.type);
      setImage(book.image || "");
      setTotal(book.total || "");
    }

  }, [id, isEdit, navigate]);

  // ✅ AFTER hooks → admin check
  if(user.role !== "admin"){
    return <h2 style={{color:"white",padding:"40px"}}>Access Denied</h2>;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !author || !category || !type) {
      alert("Fill all fields");
      return;
    }

    let books = JSON.parse(localStorage.getItem("books")) || [];

    const newBook = {
      title,
      author,
      category,
      type,
      image,
      ...(type === "physical" && {
        total: Number(total),
        available: Number(total)
      })
    };

    if (isEdit) {
      books[id] = newBook;
      alert("Book updated");
    } else {
      books.push(newBook);
      alert("Book added");
    }

    localStorage.setItem("books", JSON.stringify(books));

    navigate("/books");
  };

  return (

    <div className="edit-book">

      <h2>{isEdit ? "Edit Book" : "Add Book"}</h2>

      <form onSubmit={handleSubmit}>

        <input
          placeholder="Title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />

        <input
          placeholder="Author"
          value={author}
          onChange={(e)=>setAuthor(e.target.value)}
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
        />

        <select value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="">Select Type</option>
          <option value="virtual">Virtual</option>
          <option value="physical">Physical</option>
        </select>

        {type === "physical" && (
          <input
            type="number"
            placeholder="Total Books"
            value={total}
            onChange={(e)=>setTotal(e.target.value)}
          />
        )}

        <input type="file" onChange={handleImageUpload} />

        {image && (
          <img src={image} alt="preview" className="edit-preview" />
        )}

        <button type="submit">
          {isEdit ? "Update Book" : "Add Book"}
        </button>

      </form>

    </div>
  );
}

export default AddEditBook;