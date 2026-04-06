import { useEffect, useState } from "react";
import "./MyLibrary.css";

function MyLibrary(){

const [reading,setReading] = useState([]);
const [borrowed,setBorrowed] = useState([]);
const [favorites,setFavorites] = useState([]);

const loadData = () => {

const virtual = JSON.parse(localStorage.getItem("virtualBooks")) || {};
const borrowedBooks = JSON.parse(localStorage.getItem("borrowedBooks")) || [];
const fav = JSON.parse(localStorage.getItem("favorites")) || [];

const readingList = Object.keys(virtual).map(title=>{
const start = virtual[title].start;
const days = Math.floor((Date.now()-start)/(1000*60*60*24));
return {
title,
daysLeft:15 - days
};
});

const borrowedList = borrowedBooks.map(b=>{
const days = Math.floor((Date.now()-b.start)/(1000*60*60*24));
return {
...b,
daysLeft:90 - days
};
});

setReading(readingList);
setBorrowed(borrowedList);
setFavorites(fav);
};

useEffect(()=>{
loadData();
},[]);


// 🔥 RETURN BOOK
const returnBook = (title) => {

let borrowedBooks = JSON.parse(localStorage.getItem("borrowedBooks")) || [];
let books = JSON.parse(localStorage.getItem("books")) || [];

// remove from borrowed
borrowedBooks = borrowedBooks.filter(b => b.title !== title);

// increase stock
books = books.map(b => {
if(b.title === title){
return {...b, available: b.available + 1};
}
return b;
});

localStorage.setItem("borrowedBooks", JSON.stringify(borrowedBooks));
localStorage.setItem("books", JSON.stringify(books));

alert("Book returned");

loadData();
};


// 🔥 REMOVE FAVORITE
const removeFavorite = (title) => {
let fav = JSON.parse(localStorage.getItem("favorites")) || [];
fav = fav.filter(b => b.title !== title);
localStorage.setItem("favorites", JSON.stringify(fav));
loadData();
};

return(

<div className="library-page">

<h2>My Library</h2>

{/* Reading */}
<div className="section">
<h3>Currently Reading</h3>

{reading.length===0 && <p>No books</p>}

<div className="row">
{reading.map((b,i)=>(
<div key={i} className="card">
<h4>{b.title}</h4>
<p>{b.daysLeft>0 ? `${b.daysLeft} days left` : "Expired"}</p>
</div>
))}
</div>
</div>


{/* Borrowed */}
<div className="section">
<h3>Borrowed Books</h3>

{borrowed.length===0 && <p>No books</p>}

<div className="row">
{borrowed.map((b,i)=>(
<div key={i} className="card">
<h4>{b.title}</h4>
<p>{b.daysLeft>0 ? `${b.daysLeft} days left` : "Overdue"}</p>

<button onClick={()=>returnBook(b.title)}>
Return Book
</button>

</div>
))}
</div>
</div>


{/* Favorites */}
<div className="section">
<h3>Favorites</h3>

{favorites.length===0 && <p>No favorites</p>}

<div className="row">
{favorites.map((b,i)=>(
<div key={i} className="card">
<h4>{b.title}</h4>
<p>{b.author}</p>

<button onClick={()=>removeFavorite(b.title)}>
Remove
</button>

</div>
))}
</div>
</div>

</div>

)

}

export default MyLibrary;