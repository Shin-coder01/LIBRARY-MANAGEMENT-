import { useNavigate, useOutletContext } from "react-router-dom";
import { useState } from "react";
import "./Books.css";

function Books(){

const { search = "" } = useOutletContext() || {};
const navigate = useNavigate();
const user = JSON.parse(localStorage.getItem("user")) || {};

const [refresh, setRefresh] = useState(0);

/* DEFAULT BOOKS */
const defaultBooks = [
{title:"Failing Light",author:"Carter Woods",category:"Adventure",type:"physical",image:"https://m.media-amazon.com/images/I/81eB+7+CkUL.jpg", total:2, available:2},
{title:"The Long Blackout",author:"Robert J. Walker",category:"Mystery",type:"physical",image:"https://m.media-amazon.com/images/I/91HHqVTAJQL.jpg", total:2, available:2},
{title:"And Then He Pressed Play",author:"Robert Halliwell",category:"Romance",type:"physical",image:"https://m.media-amazon.com/images/I/81WcnNQ-TBL.jpg", total:2, available:2},
{title:"Atomic Habits",author:"James Clear",category:"Self Help",type:"virtual",image:"https://m.media-amazon.com/images/I/91bYsX41DVL.jpg"},
{title:"The Alchemist",author:"Paulo Coelho",category:"Adventure",type:"physical",image:"https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg", total:3, available:3},
{title:"Rich Dad Poor Dad",author:"Robert Kiyosaki",category:"Finance",type:"physical",image:"https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg", total:2, available:2},
{title:"The Psychology of Money",author:"Morgan Housel",category:"Finance",type:"virtual",image:"https://m.media-amazon.com/images/I/71g2ednj0JL.jpg"},
{title:"Harry Potter",author:"J.K. Rowling",category:"Fantasy",type:"virtual",image:"https://m.media-amazon.com/images/I/81YOuOGFCJL.jpg"},
{title:"The Hobbit",author:"J.R.R. Tolkien",category:"Fantasy",type:"physical",image:"https://m.media-amazon.com/images/I/91b0C2YNSrL.jpg", total:2, available:2},
{title:"The Notebook",author:"Nicholas Sparks",category:"Romance",type:"physical",image:"https://m.media-amazon.com/images/I/81bGKUa1e0L.jpg", total:2, available:2},
{title:"The Great Gatsby",author:"F. Scott Fitzgerald",category:"Classic",type:"virtual",image:"https://m.media-amazon.com/images/I/81af+MCATTL.jpg"},
{title:"1984",author:"George Orwell",category:"Classic",type:"physical",image:"https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg", total:2, available:2},
{title:"Animal Farm",author:"George Orwell",category:"Classic",type:"physical",image:"https://m.media-amazon.com/images/I/91VokXkn8hL.jpg", total:2, available:2},
{title:"The Power of Now",author:"Eckhart Tolle",category:"Self Help",type:"virtual",image:"https://m.media-amazon.com/images/I/71E8VNPC1dL.jpg"},
{title:"Deep Work",author:"Cal Newport",category:"Self Help",type:"virtual",image:"https://m.media-amazon.com/images/I/71m-MxdJ2WL.jpg"},
{title:"Zero to One",author:"Peter Thiel",category:"Business",type:"physical",image:"https://m.media-amazon.com/images/I/71uAI28kJuL.jpg", total:2, available:2},
{title:"The Lean Startup",author:"Eric Ries",category:"Business",type:"physical",image:"https://m.media-amazon.com/images/I/81-QB7nDh4L.jpg", total:2, available:2},
{title:"Ready Player One",author:"Ernest Cline",category:"Sci-Fi",type:"virtual",image:"https://m.media-amazon.com/images/I/81WcnNQ-TBL.jpg"},
{title:"It Ends With Us",author:"Colleen Hoover",category:"Romance",type:"physical",image:"https://m.media-amazon.com/images/I/81s0B6NYXML.jpg", total:2, available:2},
{title:"Verity",author:"Colleen Hoover",category:"Romance",type:"virtual",image:"https://m.media-amazon.com/images/I/91dSMhdIzTL.jpg"}
];

let books = JSON.parse(localStorage.getItem("books")) || defaultBooks;
localStorage.setItem("books", JSON.stringify(books));

const categories=["Romance","Adventure","Mystery","Self Help","Fantasy","Sci-Fi","Business","Classic","Finance"];

/* READ */
const readBook=(book)=>{
const issued=JSON.parse(localStorage.getItem("virtualBooks"))||{};
issued[book.title]={start:Date.now()};
localStorage.setItem("virtualBooks",JSON.stringify(issued));
navigate(`/reader/${book.title}`);
};

const isReading=(book)=>{
const issued=JSON.parse(localStorage.getItem("virtualBooks"))||{};
return issued[book.title];
};

const getDaysLeft=(book)=>{
const issued=JSON.parse(localStorage.getItem("virtualBooks"))||{};
if(!issued[book.title]) return null;
const days=Math.floor((Date.now()-issued[book.title].start)/(1000*60*60*24));
return 15 - days;
};

/* CHECKOUT */
const checkoutBook=(book)=>{
let storedBooks = JSON.parse(localStorage.getItem("books")) || [];
const borrowed=JSON.parse(localStorage.getItem("borrowedBooks"))||[];

if(borrowed.find(b=>b.title===book.title)){
alert("Already borrowed");
return;
}

storedBooks = storedBooks.map(b=>{
if(b.title===book.title){
if(b.available<=0){
alert("Out of stock");
return b;
}
return {...b, available:b.available-1};
}
return b;
});

localStorage.setItem("books", JSON.stringify(storedBooks));

borrowed.push({title:book.title,author:book.author,start:Date.now()});
localStorage.setItem("borrowedBooks",JSON.stringify(borrowed));

alert("Book borrowed");
setRefresh(prev=>prev+1);
};

const getBorrowDaysLeft=(book)=>{
const borrowed=JSON.parse(localStorage.getItem("borrowedBooks"))||[];
const found=borrowed.find(b=>b.title===book.title);
if(!found) return null;
const days=Math.floor((Date.now()-found.start)/(1000*60*60*24));
return 90 - days;
};

/* FAVORITE */
const addFavorite=(book)=>{
const fav=JSON.parse(localStorage.getItem("favorites"))||[];
if(!fav.find(b=>b.title===book.title)){
fav.push(book);
localStorage.setItem("favorites",JSON.stringify(fav));
alert("Added to favorites");
setRefresh(prev=>prev+1);
}else{
alert("Already in favorites");
}
};

const searchFilter=books.filter(book=>
book.title.toLowerCase().includes(search.toLowerCase()) ||
book.author.toLowerCase().includes(search.toLowerCase())
);

return(
<div className="books-page">

{categories
.filter(cat=>searchFilter.some(book=>book.category===cat))
.map(cat=>(

<div className="books-section" key={cat}>
<h2>{cat}</h2>

<div className="book-row">

{searchFilter
.filter(book=>book.category===cat)
.map((book,index)=>(

<div className="book-card" key={index}>

<div className="book-image">
<img src={book.image} alt={book.title}/>
<div className="fav-icon" onClick={()=>addFavorite(book)}>❤</div>
</div>

<h4>{book.title}</h4>
<p>{book.author}</p>

{book.type==="physical"
? <p>Available: {book.available} / {book.total}</p>
: <p style={{visibility:"hidden"}}>.</p>}

<div className="book-buttons">

{/* BOTH ADMIN + STUDENT */}
{(user.role==="student" || user.role==="admin") && book.type==="virtual" && (
isReading(book)
? (getDaysLeft(book)>0
? <button onClick={()=>navigate(`/reader/${book.title}`)}>
    Continue ({getDaysLeft(book)} days)
  </button>
: user.role==="admin"
  ? <button onClick={()=>readBook(book)}>Continue</button>
  : <button onClick={()=>navigate(`/payment/${book.title}`)}>Expired</button>)
: <button onClick={()=>readBook(book)}>Read</button>
)}

{(user.role==="student" || user.role==="admin") && book.type==="physical" && (
getBorrowDaysLeft(book)
? <button disabled>{getBorrowDaysLeft(book)} days left</button>
: book.available>0
? <button onClick={()=>checkoutBook(book)}>Checkout</button>
: <button disabled>Out of Stock</button>
)}

{/* ADMIN ONLY */}
{user.role==="admin" && (
<button onClick={()=>navigate(`/edit-book/${index}`)}>
Edit
</button>
)}

</div>

</div>

))}

</div>
</div>
))}

</div>
);
}

export default Books;