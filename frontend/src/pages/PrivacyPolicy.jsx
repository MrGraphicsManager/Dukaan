import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-page">
      <style>{`
        .privacy-policy-page {
          --cream: #F7F2E9;
          --navy: #1E1B4B;
          --navy-soft: #2E2A63;
          --terracotta: #C9713F;
          --terracotta-soft: #E8935F;
          --line: #E4DCC9;
          --text-muted: #5A5670;

          min-height: 100vh;
          background: var(--cream);
          color: var(--navy);
          font-family: Georgia, "Times New Roman", serif;
          line-height: 1.65;
        }

        .privacy-policy-page *,
        .privacy-policy-page *::before,
        .privacy-policy-page *::after {
          box-sizing: border-box;
        }

        .privacy-policy-header {
          padding: 28px 48px;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .privacy-policy-brand {
          font-size: 22px;
          font-weight: 700;
          color: var(--navy);
          text-decoration: none;
        }

        .privacy-policy-brand span {
          color: var(--terracotta);
        }

        .privacy-policy-main {
          max-width: 760px;
          margin: 0 auto;
          padding: 64px 24px 100px;
        }

        .privacy-policy-main h1 {
          font-size: 42px;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
          font-weight: 700;
          color: var(--navy);
        }

        .privacy-policy-updated {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--terracotta);
          margin-bottom: 48px;
        }

        .privacy-policy-main h2 {
          font-size: 22px;
          margin-top: 44px;
          margin-bottom: 12px;
          color: var(--navy-soft);
          font-weight: 700;
        }

        .privacy-policy-main p,
        .privacy-policy-main li {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 15.5px;
          color: #3A3660;
        }

        .privacy-policy-main ul {
          padding-left: 20px;
        }

        .privacy-policy-main li {
          margin-bottom: 8px;
        }

        .privacy-policy-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 24px 28px;
          margin-top: 48px;
        }

        .privacy-policy-card h3 {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--terracotta);
          margin: 0 0 10px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .privacy-policy-card p {
          margin: 4px 0;
        }

        .privacy-policy-page a {
          color: var(--terracotta);
          text-decoration: none;
        }

        .privacy-policy-page a:hover {
          text-decoration: underline;
        }

        .privacy-policy-footer {
          text-align: center;
          padding: 32px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          color: var(--text-muted);
          border-top: 1px solid var(--line);
        }

        @media (max-width: 640px) {
          .privacy-policy-header {
            padding: 22px 24px;
          }

          .privacy-policy-brand {
            font-size: 20px;
          }

          .privacy-policy-main {
            padding: 48px 20px 70px;
          }

          .privacy-policy-main h1 {
            font-size: 34px;
          }

          .privacy-policy-main h2 {
            font-size: 20px;
            margin-top: 36px;
          }

          .privacy-policy-main p,
          .privacy-policy-main li {
            font-size: 15px;
          }

          .privacy-policy-card {
            padding: 20px;
          }

          .privacy-policy-footer {
            padding: 28px 20px;
          }
        }
      `}</style>

      <header className="privacy-policy-header">
        <a href="/" className="privacy-policy-brand font-bold text-2xl">
          Dukaan
        </a>
      </header>

      <main className="privacy-policy-main">
        <h1>Privacy Policy</h1>

        <div className="privacy-policy-updated">
          Last updated · August 2026
        </div>

        <p>
          Dukaan ("we", "our", "us") provides billing, inventory and
          udhaar-tracking tools for small shops, cafés and neighbourhood
          stores. This page explains what information we collect, how we use
          it, and the choices you have.
        </p>

        <h2>1. Information we collect</h2>

        <ul>
          <li>
            <strong>Account details</strong> — your name, shop name, phone
            number and email address when you sign up.
          </li>

          <li>
            <strong>Business data</strong> — products, prices, stock levels,
            customer records and udhaar (credit) entries you add to run your
            shop.
          </li>

          <li>
            <strong>Payment information</strong> — plan and transaction
            details when you pay via UPI. We do not store your UPI PIN or
            full payment credentials; these are handled by our payment
            partner.
          </li>

          <li>
            <strong>Usage data</strong> — basic device and app-usage
            information to help us fix bugs and improve the product.
          </li>
        </ul>

        <h2>2. How we use your information</h2>

        <ul>
          <li>
            To run the core features of the app — billing, inventory, udhaar
            tracking and reports.
          </li>

          <li>
            To send order, payment and low-stock notifications you've opted
            into (including via WhatsApp, where applicable).
          </li>

          <li>
            To provide customer support and respond to your queries.
          </li>

          <li>
            To improve reliability and add features shop owners ask for.
          </li>
        </ul>

        <h2>3. What we don't do</h2>

        <ul>
          <li>
            We don't sell your business or customer data to third parties.
          </li>

          <li>
            We don't share your udhaar or customer records outside your
            account without your permission, except where required by law.
          </li>
        </ul>

        <h2>4. Data storage & security</h2>

        <p>
          Your data is stored on secured servers with access limited to
          what's needed to run the service. We use standard encryption
          practices to protect data in transit. No system is completely
          risk-free, and we encourage you to use a strong password and keep
          your login details private.
        </p>

        <h2>5. Your choices</h2>

        <ul>
          <li>
            You can access, correct or export your business data from within
            your account.
          </li>

          <li>
            You can request deletion of your account and associated data by
            writing to us — see contact details below.
          </li>

          <li>
            You can opt out of non-essential notifications at any time from
            app settings.
          </li>
        </ul>

        <h2>6. Third-party services</h2>

        <p>
          We use trusted third parties for payments (UPI processing) and
          messaging (WhatsApp reminders, where enabled). These providers only
          receive the minimum information needed to perform their function
          and have their own privacy practices.
        </p>

        <h2>7. Children's privacy</h2>

        <p>
          Dukaan is intended for shop owners and business use. It is not
          directed at children, and we do not knowingly collect data from
          anyone under 18.
        </p>

        <h2>8. Changes to this policy</h2>

        <p>
          We may update this policy from time to time as the product evolves.
          Material changes will be reflected on this page with an updated
          date at the top.
        </p>

        <div className="privacy-policy-card">
          <h3>Questions about your data?</h3>

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
        </div>
      </main>

      <footer className="privacy-policy-footer">
        © 2026 Dukaan · Made for Indian small businesses
      </footer>
    </div>
  );
};

export default PrivacyPolicy;