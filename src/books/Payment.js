import { useParams, useNavigate } from "react-router-dom";
import "./Payment.css";

function Payment(){

const { title } = useParams();
const navigate = useNavigate();

const handlePayment = ()=>{

const paid = JSON.parse(localStorage.getItem("paidBooks")) || [];

if(!paid.includes(title)){
paid.push(title);
localStorage.setItem("paidBooks",JSON.stringify(paid));
}

alert("Payment successful. You can now read the book.");

navigate(`/reader/${title}`);
};

return(

<div className="payment-page">

<div className="payment-box">

<h2>Unlock Book</h2>

<p>{title}</p>

<p>Pay ₹99 to unlock full PDF</p>

<button onClick={handlePayment}>
Pay Now
</button>

</div>

</div>

)

}

export default Payment;