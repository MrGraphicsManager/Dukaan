import React from "react";

const RefundPolicy = () => {
  return (
    <div className="refund-policy-page">
      <style>{`
        .refund-policy-page {
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

        .refund-policy-page *,
        .refund-policy-page *::before,
        .refund-policy-page *::after {
          box-sizing: border-box;
        }

        .refund-policy-header {
          padding: 28px 48px;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .refund-policy-brand {
          font-size: 22px;
          font-weight: 700;
          color: var(--navy);
          text-decoration: none;
        }

        .refund-policy-brand span {
          color: var(--terracotta);
        }

        .refund-policy-main {
          max-width: 760px;
          margin: 0 auto;
          padding: 64px 24px 100px;
        }

        .refund-policy-main h1 {
          font-size: 42px;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
          font-weight: 700;
        }

        .refund-policy-updated {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--terracotta);
          margin-bottom: 48px;
        }

        .refund-policy-main h2 {
          font-size: 22px;
          margin-top: 44px;
          margin-bottom: 12px;
          color: var(--navy-soft);
        }

        .refund-policy-main p,
        .refund-policy-main li {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 15.5px;
          color: #3A3660;
        }

        .refund-policy-main ul {
          padding-left: 20px;
        }

        .refund-policy-main li {
          margin-bottom: 8px;
        }

        .refund-policy-main table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14.5px;
        }

        .refund-policy-main th,
        .refund-policy-main td {
          text-align: left;
          padding: 12px 14px;
          border-bottom: 1px solid var(--line);
        }

        .refund-policy-main th {
          color: var(--terracotta);
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        .refund-policy-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 24px 28px;
          margin-top: 48px;
        }

        .refund-policy-card h3 {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--terracotta);
          margin: 0 0 10px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .refund-policy-card p {
          margin: 4px 0;
        }

        .refund-policy-page a {
          color: var(--terracotta);
          text-decoration: none;
        }

        .refund-policy-page a:hover {
          text-decoration: underline;
        }

        .refund-policy-footer {
          text-align: center;
          padding: 32px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          color: var(--text-muted);
          border-top: 1px solid var(--line);
        }

        @media (max-width: 640px) {
          .refund-policy-header {
            padding: 22px 24px;
          }

          .refund-policy-brand {
            font-size: 20px;
          }

          .refund-policy-main {
            padding: 48px 20px 70px;
          }

          .refund-policy-main h1 {
            font-size: 34px;
          }

          .refund-policy-main h2 {
            font-size: 20px;
            margin-top: 36px;
          }

          .refund-policy-main p,
          .refund-policy-main li {
            font-size: 15px;
          }

          .refund-policy-main table {
            font-size: 13px;
          }

          .refund-policy-main th,
          .refund-policy-main td {
            padding: 10px 8px;
          }

          .refund-policy-card {
            padding: 20px;
          }

          .refund-policy-footer {
            padding: 28px 20px;
          }
        }
      `}</style>

      <header className="refund-policy-header">
        <a href="/" className="refund-policy-brand font-bold text-2xl">
          Dukaan
        </a>
      </header>

      <main className="refund-policy-main">
        <h1>Refund Policy</h1>

        <div className="refund-policy-updated">
          Last updated · August 2026
        </div>

        <p>
          We want shop owners to feel confident subscribing to Dukaan. This
          policy explains how refunds work for our Starter, Business and
          Premium plans.
        </p>

        <h2>1. One-time setup fee</h2>

        <p>
          The one-time setup fee (₹299 / ₹499 / ₹999 depending on plan) covers
          account creation and onboarding support. This fee is non-refundable
          once your account has been set up, since the work is completed
          upfront.
        </p>

        <h2>2. Monthly subscription</h2>

        <ul>
          <li>
            If you cancel within <strong>7 days</strong> of your first payment
            and haven't actively used core features (billing, inventory or
            udhaar entries beyond test data), you're eligible for a full
            refund of that month's subscription fee.
          </li>

          <li>
            If you cancel after 7 days, or after actively using the app to run
            your shop, we don't offer a pro-rated refund for the remaining
            days in that billing cycle — but your access continues until the
            end of the paid period.
          </li>

          <li>
            Refunds are not provided for months already used in full.
          </li>
        </ul>

        <h2>3. Plan upgrades & downgrades</h2>

        <p>
          If you upgrade mid-cycle, we charge the difference for the remaining
          days. If you downgrade, the new (lower) rate applies from your next
          billing date — we don't refund the difference for the current cycle.
        </p>

        <h2>4. Duplicate or failed payments</h2>

        <p>
          If you're charged twice by mistake, or a payment fails but money is
          deducted from your account, write to us with your UPI transaction
          ID. Verified duplicate or failed-but-deducted payments are refunded
          in full within 5–7 business days.
        </p>

        <h2>5. How refunds are processed</h2>

        <table>
          <thead>
            <tr>
              <th>Step</th>
              <th>What happens</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1. Request</td>
              <td>
                Email us with your registered phone number and transaction ID
              </td>
            </tr>

            <tr>
              <td>2. Review</td>
              <td>
                We verify the request, usually within 2 business days
              </td>
            </tr>

            <tr>
              <td>3. Refund</td>
              <td>
                Approved refunds are credited to your original UPI account
                within 5–7 business days
              </td>
            </tr>
          </tbody>
        </table>

        <h2>6. Cancellations</h2>

        <p>
          You can cancel your subscription any time from your account settings
          or by writing to us. Cancelling stops future billing but doesn't
          automatically trigger a refund for the current cycle — see section 2
          above.
        </p>

        <div className="refund-policy-card">
          <h3>Need a refund or have a billing issue?</h3>

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

          <p>
            Please include your registered phone number and UPI transaction ID
            so we can look into it faster.
          </p>
        </div>
      </main>

      <footer className="refund-policy-footer">
        © 2026 Dukaan · Made for Indian small businesses
      </footer>
    </div>
  );
};

export default RefundPolicy;