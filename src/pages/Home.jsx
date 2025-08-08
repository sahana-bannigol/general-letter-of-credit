import React from 'react';
import '../styles/theme.css';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container">
      <h2>G-LOC: The Future of Trade Finance</h2>
      <p>
        Unlock liquidity, transparency, and automation for Small and Medium Enterprises (SMEs) with our smart contract-powered Letter of Credit platform.
      </p>
      <h3>How It Works</h3>
      <ul>
        <li>Importers issue digital LCs by depositing ethereum into smart contracts.</li>
        <li>Oracles verify shipping and customs data in real-time, triggering automated fund release when conditions are met.</li>
        <li>Exporters can trade or fractionalize LCs on a decentralized marketplace, unlocking working capital and liquidity.</li>
      </ul>
      <Link to="/dashboard" className="btn get-started-button">
          <button type="button">
            Get Started
          </button>
      </Link>
    </div>
  );
}
