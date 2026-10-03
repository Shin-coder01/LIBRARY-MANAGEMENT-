import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight, FiCheck, FiLock } from "react-icons/fi";
import PointillistScene from "../Components/PointillistScene";
import { readStorage, writeStorage } from "../common/storage";
import "./Payment.css";

const decodeTitle = (value) => {
  try { return decodeURIComponent(value); } catch { return value; }
};

function Payment() {
  const { title: routeTitle } = useParams();
  const title = decodeTitle(routeTitle || "");
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(() => {
    const saved = readStorage("paidBooks", {});
    const start = Number(Array.isArray(saved) ? NaN : saved[title]?.start || saved[title]);
    return Number.isFinite(start) && Date.now() - start < 15 * 86400000;
  });

  const activateDemoAccess = () => {
    const stored = readStorage("paidBooks", {});
    const paid = Array.isArray(stored) ? {} : stored;
    paid[title] = Date.now();
    writeStorage("paidBooks", paid);
    const virtual = readStorage("virtualBooks", {});
    virtual[title] = { start: Date.now() };
    writeStorage("virtualBooks", virtual);
    setUnlocked(true);
  };

  return (
    <main className="payment-page">
      <div className="payment-topline"><Link to="/my-library"><FiArrowLeft aria-hidden="true" /> My library</Link><span><FiLock aria-hidden="true" /> Demo checkout</span></div>
      <div className="payment-layout">
        <section className="payment-story pointillist-host">
          <PointillistScene variant="atlas" className="pointillist-scene--soft" />
          <p className="dashboard-kicker">A little more time with a good book</p>
          <h1>Stay with<br /><em>the story.</em></h1>
          <p>Your 15-day reading pass for this title has ended. You can activate a fresh demo pass below.</p>
          <div className="payment-title-line"><span>Selected title</span><strong>{title}</strong></div>
        </section>

        <section className="payment-checkout" aria-labelledby="checkout-heading">
          <div className="payment-secure"><FiLock aria-hidden="true" /> No payment provider connected</div>
          <p className="dashboard-kicker">Checkout</p>
          <h2 id="checkout-heading">Demo access</h2>
          <div className="payment-line"><span>Digital reading pass</span><strong>15 days</strong></div>
          <div className="payment-line payment-total"><span>Demo amount</span><strong>₹99</strong></div>
          <p className="payment-disclaimer">This project does not process payments. Activating demo access does not charge you or send payment details anywhere.</p>
          {unlocked ? (
            <div className="payment-success" role="status"><FiCheck aria-hidden="true" /><span>Demo reading access is active for 15 days.</span></div>
          ) : (
            <button className="payment-activate" type="button" onClick={activateDemoAccess}>Activate demo access <FiArrowUpRight aria-hidden="true" /></button>
          )}
          {unlocked && <button className="payment-continue" type="button" onClick={() => navigate(`/reader/${encodeURIComponent(title)}`)}>Continue to reader <FiArrowUpRight aria-hidden="true" /></button>}
          <Link className="payment-cancel" to="/books">Return to catalogue</Link>
        </section>
      </div>
    </main>
  );
}

export default Payment;
