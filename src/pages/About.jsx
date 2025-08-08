import React from 'react';
import '../styles/theme.css';
export default function About() {
  return (
    <div className="container">
      <h2>About G-LOC</h2>
      <p>
        Our mission is to modernize global trade finance by delivering fast, transparent, and secure Letters of Credit through blockchain technology and smart contracts—empowering SMEs worldwide.
      </p>
      <p>
        G-LOC digitizes Letters of Credit, transforming them into tokenized financial instruments backed by on-chain escrow. Our smart contracts automate compliance, shipment verification, and payment release.
      </p>
      <h3>Security & Compliance</h3>
      <p>
        We prioritize security with multi-signature wallets, strict KYC/AML compliance, and UCP 600 standards to ensure data privacy and transaction integrity.
      </p>
    </div>
  );
}
