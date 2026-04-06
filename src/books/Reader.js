import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Reader.css";

function Reader(){

const { title } = useParams();
const decodedTitle = decodeURIComponent(title);

const navigate = useNavigate();
const [daysLeft,setDaysLeft] = useState(0);

useEffect(()=>{

const data = JSON.parse(localStorage.getItem("virtualBooks")) || {};

if(!data[decodedTitle]){
navigate("/books");
return;
}

const start = data[decodedTitle].start;
const days = Math.floor((Date.now()-start)/(1000*60*60*24));

const remaining = 15 - days;

setDaysLeft(remaining);

if(remaining <= 0){
alert("Reading period expired");
navigate(`/payment/${encodeURIComponent(decodedTitle)}`);
}

},[decodedTitle,navigate]);

return(

<div className="reader-page">

<h2>{decodedTitle}</h2>

<p>{daysLeft} days remaining</p>

<div className="reader-box">

<iframe
title="book"
src={`https://www.google.com/search?q=${encodeURIComponent(decodedTitle)}+book+pdf`}
width="100%"
height="500px"
/>

</div>

</div>

)

}

export default Reader;