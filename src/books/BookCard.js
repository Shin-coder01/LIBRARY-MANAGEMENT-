import { useNavigate } from "react-router-dom";
import "./BookCard.css";
function BookCard({
  book,
  user,
  isReading,
  getDaysLeft,
  getBorrowDaysLeft,
  readBook,
  checkoutBook,
  addFavorite
}) {

  const navigate = useNavigate();

  return (
    <div className="book-card">

      <div className="book-image">
        <img src={book.image} alt={book.title} />

        <div className="fav-icon" onClick={(e)=>{
          e.stopPropagation();
          addFavorite(book);
        }}>
          ❤
        </div>
      </div>

      <h4>{book.title}</h4>
      <p>{book.author}</p>

      <div className="book-buttons">

        {user.role === "student" && book.type === "virtual" && (
          isReading(book)
            ? (getDaysLeft(book) > 0
                ? <button onClick={() => navigate(`/reader/${book.title}`)}>
                    Continue ({getDaysLeft(book)} days)
                  </button>
                : <button onClick={() => navigate(`/payment/${book.title}`)}>
                    Expired - Buy PDF
                  </button>)
            : <button onClick={() => readBook(book)}>Read</button>
        )}

        {user.role === "student" && book.type === "physical" && (
          getBorrowDaysLeft(book)
            ? <button disabled>{getBorrowDaysLeft(book)} days left</button>
            : book.available > 0
              ? <button onClick={() => checkoutBook(book)}>Checkout</button>
              : <button disabled>Out of Stock</button>
        )}

      </div>

    </div>
  );
}

export default BookCard;