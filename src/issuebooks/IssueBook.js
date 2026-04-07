
import { useState, useEffect } from "react";
import "./IssueBook.css";
function IssueBook(){

const user = JSON.parse(localStorage.getItem("user")) || {};

const [student,setStudent] = useState("");
const [book,setBook] = useState("");
const [issuedBooks,setIssuedBooks] = useState([]);

useEffect(()=>{
const data = JSON.parse(localStorage.getItem("issuedBooks")) || [];
setIssuedBooks(data);
},[]);

if(user.role !== "admin"){
return <h2 style={{color:"white",padding:"40px"}}>Access Denied</h2>;
}

const issueBook = (e)=>{

e.preventDefault();

if(!student || !book){
alert("Fill all fields");
return;
}

let books = JSON.parse(localStorage.getItem("books")) || [];
let borrowed = JSON.parse(localStorage.getItem("borrowedBooks")) || [];

// find book
const found = books.find(b=>b.title === book);

if(!found){
alert("Book not found");
return;
}

if(found.available <= 0){
alert("Out of stock");
return;
}

// reduce stock
books = books.map(b=>{
if(b.title === book){
return {...b, available: b.available - 1};
}
return b;
});

// save books
localStorage.setItem("books", JSON.stringify(books));

// save borrowed (for MyLibrary)
borrowed.push({
title: book,
student,
start: Date.now()
});

localStorage.setItem("borrowedBooks", JSON.stringify(borrowed));

// save issued list (for admin table)
const newIssue = {
student,
book,
date:new Date().toLocaleDateString()
};

const updated = [...issuedBooks,newIssue];
localStorage.setItem("issuedBooks",JSON.stringify(updated));

setIssuedBooks(updated);

setStudent("");
setBook("");

alert("Book issued successfully");

};

return(

<div className="issue-page">

<h2>Issue Book</h2>

<form onSubmit={issueBook} className="issue-form">

<input
type="text"
placeholder="Student Name"
value={student}
onChange={(e)=>setStudent(e.target.value)}
/>

<select value={book} onChange={(e)=>setBook(e.target.value)}>
<option value="">Select Book</option>
{JSON.parse(localStorage.getItem("books"))?.map((b,i)=>(
<option key={i} value={b.title}>{b.title}</option>
))}
</select>

<button type="submit">
Issue Book
</button>

</form>

<h3>Issued Books</h3>

<table className="issue-table">

<thead>
<tr>
<th>Student</th>
<th>Book</th>
<th>Date</th>
</tr>
</thead>

<tbody>

{issuedBooks.map((item,index)=>(

<tr key={index}>
<td>{item.student}</td>
<td>{item.book}</td>
<td>{item.date}</td>
</tr>

))}

</tbody>

</table>

</div>

)
}

export default IssueBook;