import React from "react";

const Info = () => {
  return (
    <div className="info-page">
      <style>{`
        .info-page {
          --cream: #F7F2E9;
          --navy: #1E1B4B;
          --navy-soft: #2E2A63;
          --terracotta: #C9713F;
          --line: #E4DCC9;
          --text-muted: #5A5670;

          min-height: 100vh;
          background: var(--cream);
          color: var(--navy);
          font-family: Georgia, "Times New Roman", serif;
          line-height: 1.65;
        }

        .info-page *,
        .info-page *::before,
        .info-page *::after {
          box-sizing: border-box;
        }

        .info-header {
          padding: 28px 48px;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .info-brand {
          font-size: 22px;
          font-weight: 700;
          color: var(--navy);
          text-decoration: none;
        }

        .info-brand span {
          color: var(--terracotta);
        }

        .info-main {
          max-width: 760px;
          margin: 0 auto;
          padding: 64px 24px 100px;
        }

        .info-main h1 {
          font-size: 42px;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
          font-weight: 700;
        }

        .info-updated {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--terracotta);
          margin-bottom: 48px;
        }

        .info-main h2 {
          font-size: 22px;
          margin-top: 44px;
          margin-bottom: 12px;
          color: var(--navy-soft);
        }

        .info-main p,
        .info-main li {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 15.5px;
          color: #3A3660;
        }

        .info-main ul {
          padding-left: 20px;
        }

        .info-main li {
          margin-bottom: 8px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 20px;
        }

        .info-stat {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 20px 22px;
        }

        .info-stat b {
          display: block;
          font-size: 20px;
          color: var(--terracotta);
          font-family: Georgia, serif;
          margin-bottom: 4px;
        }

        .info-stat span {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13.5px;
          color: var(--text-muted);
        }

        .info-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 24px 28px;
          margin-top: 48px;
        }

        .info-card h3 {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--terracotta);
          margin: 0 0 10px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .info-card p {
          margin: 4px 0;
        }

        .info-page a {
          color: var(--terracotta);
          text-decoration: none;
        }

        .info-page a:hover {
          text-decoration: underline;
        }

        .info-footer {
          text-align: center;
          padding: 32px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          color: var(--text-muted);
          border-top: 1px solid var(--line);
        }

        @media (max-width: 640px) {
          .info-header {
            padding: 22px 24px;
          }

          .info-brand {
            font-size: 20px;
          }

          .info-main {
            padding: 48px 20px 70px;
          }

          .info-main h1 {
            font-size: 34px;
          }

          .info-main h2 {
            font-size: 20px;
            margin-top: 36px;
          }

          .info-main p,
          .info-main li {
            font-size: 15px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .info-card {
            padding: 20px;
          }

          .info-footer {
            padding: 28px 20px;
          }
        }
      `}</style>

      <header className="info-header">
        <a href="/" className="info-brand">
          दुकान · <span>Dukaan</span>
        </a>
      </header>

      <main className="info-main">
        <h1>About Dukaan</h1>

        <div className="info-updated">
          Simple tools for Indian shop owners
        </div>

        <p>
          Dukaan is a shop-assistant app built for kirana stores, cafés and
          neighbourhood shops across India. We built it around one idea:
          running a small shop shouldn't mean juggling a notebook for udhaar,
          a calculator for billing, and guesswork for stock.
        </p>

        <h2>What we do</h2>

        <p>
          Dukaan brings billing, inventory and udhaar (credit) tracking into
          one simple screen — built to work the way small shop owners actually
          work, with minimal setup and no learning curve.
        </p>

        <div className="info-grid">
          <div className="info-stat">
            <b>Fast POS</b>
            <span>
              Cash, UPI or udhaar — bill a customer in one tap
            </span>
          </div>

          <div className="info-stat">
            <b>Live stock</b>
            <span>
              Automatic low-stock alerts, no manual counting
            </span>
          </div>

          <div className="info-stat">
            <b>Udhaar tracking</b>
            <span>
              Know exactly who owes what, with WhatsApp reminders
            </span>
          </div>

          <div className="info-stat">
            <b>Daily reports</b>
            <span>
              Sales, cash and UPI breakdowns at a glance
            </span>
          </div>
        </div>

        <h2>Who it's for</h2>

        <ul>
          <li>Kirana and grocery stores</li>
          <li>Cafés and small restaurants</li>
          <li>
            Any neighbourhood shop that currently tracks sales or credit on
            paper
          </li>
        </ul>

        <h2>Our approach</h2>

        <p>
          We keep things simple on purpose. No long onboarding, no confusing
          dashboards — just the features a small shop actually needs, priced
          fairly, with plans starting at ₹99/month.
        </p>

        <div className="info-card">
          <h3>Get in touch</h3>

          <p>
            Email:{" "}
            <a href="mailto:contact@officialdukaan.in">
              contact@officialdukaan.in
            </a>
          </p>

          <p>
            Phone:{" "}
            <a href="tel:+917016430577">
              +91 7016430577
            </a>
          </p>

          <p>We usually respond within a day.</p>
        </div>
      </main>

      <footer className="info-footer">
        © 2026 Dukaan · Made for Indian small businesses
      </footer>
    </div>
  );
};

export default Info;