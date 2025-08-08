import React, { useState } from 'react';
import jsPDF from 'jspdf';
import '../styles/theme.css'; // Assuming you have a CSS file for styles

import {
  BrowserProvider,
  Contract,
  parseEther,
  formatEther
} from 'ethers';


import LOC_FACTORY_ABI from '../abis/factory-contract-abi.json';
import LOC_ABI from '../abis/contract-abi.json';

const LOC_FACTORY_ADDRESS = '0x9659104e2871070aF6F513c0Cfba8496b75B6f7f';

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [locs, setLocs] = useState([]);
  const [newLoc, setNewLoc] = useState({
    buyer: '',
    seller: '',
    arbiter: '',
    shipmentDeadline: '',
    verificationDeadline: ''
  });

  // Connect wallet and fetch user's LOCs
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    const _provider = new BrowserProvider(window.ethereum);
    const _signer = await _provider.getSigner();
    const _account = await _signer.getAddress();

    setProvider(_provider);
    setSigner(_signer);
    setAccount(_account);
    await fetchUserLocs(_account, _signer);
  };

  // Fetch LOC addresses from the factory and then details from each LOC contract  
  const fetchUserLocs = async (userAddress, signer) => {
    try {
      const factory = new Contract(LOC_FACTORY_ADDRESS, LOC_FACTORY_ABI, signer);
      const locAddresses = await factory.getContractsForUser(userAddress);
      const userLocs = [];

      for (const addr of locAddresses) {
        // Create a flat contract instance for the LOC
        const loc = new Contract(addr, LOC_ABI, signer);
        // Get detailed info from the LOC contract.
        const details = await loc.getContractDetails();
        // Get the user role in this LOC from the factory.
        const _role = await factory.getUserRoleInContract(userAddress, addr);

        // Attach extra fields to the contract instance
        loc.role = _role;
        loc.details = details;
        loc.address = addr;

        userLocs.push(loc);
      }

      setLocs(userLocs);
    } catch (err) {
      console.error("Error fetching LOCs:", err);
      alert("Error fetching LOCs: " + err.message);
    }
  };

  // Create a new LOC via the factory contract
  const createLoC = async () => {
    try {
      const factory = new Contract(LOC_FACTORY_ADDRESS, LOC_FACTORY_ABI, signer);
      const tx = await factory.createLoC(
        account,
        newLoc.seller,
        newLoc.arbiter,
        Number(newLoc.shipmentDeadline),
        Number(newLoc.verificationDeadline)
      );
      await tx.wait();
      alert("LOC created successfully!");
      await fetchUserLocs(account, signer);
    } catch (err) {
      console.error("Create LOC failed:", err);
      alert("Failed to create LOC: " + err.message);
    }
  };

  const downloadPdf = (loc) => {
    const [
      buyer,
      seller,
      arbiter,
      amount,
      state,
      createdAt,
      fundsDepositedAt,
      shipmentConfirmedAt,
      documentsVerifiedAt,
      paymentReleasedAt,
      refundProcessedAt,
      shipmentDeadline,
      verificationDeadline
    ] = loc.details;

    const formatDate = (timestamp) => {
      const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
      return ts > 0 ? new Date(ts * 1000).toLocaleString() : 'N/A';
    };

    const stateMap = ["Initiated", "Funded", "Shipped", "Verified", "Completed", "Refunded"];
    const stateLabel = stateMap[Number(state)];
    const doc = new jsPDF();

    let y = 20;
    doc.setFontSize(18);
    doc.text("Letter of Credit Summary", 20, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Contract Address: ${loc.address}`, 20, y);
    y += 10;
    doc.text(`Status: ${stateLabel}`, 20, y);

    // Divider
    y += 8;
    doc.line(20, y, 190, y);
    y += 10;

    // Section: Parties
    doc.setFont("helvetica", "bold");
    doc.text("Parties Involved", 20, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text(`Buyer: ${buyer}`, 20, y);
    y += 6;
    doc.text(`Seller: ${seller}`, 20, y);
    y += 6;
    doc.text(`Arbiter (Bank): ${arbiter}`, 20, y);

    // Divider
    y += 8;
    doc.line(20, y, 190, y);
    y += 10;

    // Section: Financials
    doc.setFont("helvetica", "bold");
    doc.text("Financials", 20, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text(`Amount: ${formatEther(amount)} ETH`, 20, y);

    // Divider
    y += 8;
    doc.line(20, y, 190, y);
    y += 10;

    // Section: Timeline
    doc.setFont("helvetica", "bold");
    doc.text("Timeline", 20, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text(`Created At: ${formatDate(createdAt)}`, 20, y);
    y += 6;
    doc.text(`Funds Deposited At: ${formatDate(fundsDepositedAt)}`, 20, y);
    y += 6;
    doc.text(`Shipment Confirmed At: ${formatDate(shipmentConfirmedAt)}`, 20, y);
    y += 6;
    doc.text(`Documents Verified At: ${formatDate(documentsVerifiedAt)}`, 20, y);
    y += 6;
    doc.text(`Payment Released At: ${formatDate(paymentReleasedAt)}`, 20, y);
    y += 6;
    doc.text(`Refund Processed At: ${formatDate(refundProcessedAt)}`, 20, y);

    // Divider
    y += 8;
    doc.line(20, y, 190, y);
    y += 10;

    // Section: Deadlines
    doc.setFont("helvetica", "bold");
    doc.text("Deadlines", 20, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text(`Shipment Deadline: ${formatDate(shipmentDeadline)}`, 20, y);
    y += 6;
    doc.text(`Verification Deadline: ${formatDate(verificationDeadline)}`, 20, y);

    // Footer
    y += 15;
    doc.setFontSize(10);
    doc.text("Generated by G-LOC Decentralized Trade Finance App", 20, y);

    doc.save(`LOC-${loc.address.slice(0, 6)}.pdf`);
    console.log("PDF downloaded successfully");
    alert("PDF downloaded successfully!");
  };

  // Handle various actions on a LOC contract
  const handleAction = async (loc, action) => {
    try {
      console.log(`Processing ${action}...`);
      let tx;

      switch (action) {
        case "depositFunds": {
          const amount = prompt("Enter deposit amount in ETH:");
          if (!amount || isNaN(amount) || Number(amount) <= 0) {
            alert("Invalid amount.");
            return;
          }
          tx = await loc.depositFunds({ value: parseEther(amount) });
          break;
        }
        case "confirmShipment":
          tx = await loc.confirmShipment();
          break;
        case "verifyDocuments":
          tx = await loc.verifyDocuments();
          break;
        case "releasePayment":
          tx = await loc.releasePayment();
          break;
        case "refundBuyer":
          tx = await loc.refundBuyer();
          break;
        default:
          alert("Invalid action");
          return;
      }

      console.log("Waiting for transaction confirmation...");
      await tx.wait();
      console.log(`${action} executed successfully`);

      alert(`${action} successful!`);
      await fetchUserLocs(account, signer);
    } catch (err) {
      console.error(`Error during ${action}:`, err);
      alert(`Failed to ${action}: ${err.message}`);
    }
  };

  // Render the LOC state based on the enum value (index 4 of details)
  const renderLoCState = (state) => {
    const states = ["Initiated", "Funded", "Shipped", "Verified", "Completed", "Refunded"];
    return states[state] || "Unknown";
  };

  return (
    <div className="container">
      <h1><center>G-LOC Dashboard</center></h1>
      {!account ? (
        <center><button onClick={connectWallet}>Connect Wallet</button></center>
      ) : (
        <>
          <center><p><strong>Connected as:</strong> {account}</p></center>

          <h2>Create New LOC</h2>
          <div className="loc-card">
            <input
              placeholder="Seller Address"
              value={newLoc.seller}
              onChange={e => setNewLoc({ ...newLoc, seller: e.target.value })}
            />
            <input
              placeholder="Arbiter Address"
              value={newLoc.arbiter}
              onChange={e => setNewLoc({ ...newLoc, arbiter: e.target.value })}
            />
            <input
              placeholder="Shipment Deadline (days)"
              type="number"
              value={newLoc.shipmentDeadline}
              onChange={e => setNewLoc({ ...newLoc, shipmentDeadline: e.target.value })}
            />
            <input
              placeholder="Verification Deadline (days)"
              type="number"
              value={newLoc.verificationDeadline}
              onChange={e => setNewLoc({ ...newLoc, verificationDeadline: e.target.value })}
            />
            <button onClick={createLoC}>Create LoC</button>
          </div>
          <h2 className="section-title">My LoCs</h2>
          {locs.map((loc, i) => (
            <div key={i} className="loc-card">
              <p><strong>Contract Address:</strong> {loc.address}</p>
              <p><strong>Role in LoC:</strong> {loc.role}</p>
              <p>
                <strong>Status:</strong> {renderLoCState(loc.details[4])}
              </p>
              <p>
                <strong>Amount:</strong> {formatEther(loc.details[3])} ETH
              </p>

              {/* Action buttons based on the role and state */}
              {loc.role === "Buyer" && Number(loc.details[4]) === 0 && (
                <button onClick={() => handleAction(loc, "depositFunds")}>
                  Deposit Funds
                </button>
              )}
              {loc.role === "Seller" && Number(loc.details[4]) === 1 && (
                <button onClick={() => handleAction(loc, "confirmShipment")}>
                  Confirm Shipment
                </button>
              )}
              {loc.role === "Bank" && Number(loc.details[4]) === 2 && (
                <button onClick={() => handleAction(loc, "verifyDocuments")}>
                  Verify Documents
                </button>
              )}
              {["Buyer", "Bank"].includes(loc.role) && Number(loc.details[4]) === 3 && (
                <button onClick={() => handleAction(loc, "releasePayment")}>
                  Release Payment
                </button>
              )}
              {loc.role === "Buyer" && Number(loc.details[4]) === 4 &&(
                <button onClick={() => handleAction(loc, "refundBuyer")}>
                  Request Refund
                </button>
              )}
              {["Buyer", "Seller", "Bank"].includes(loc.role) && Number(loc.details[4]) === 4 && (
                <button onClick={() => downloadPdf(loc)}>
                  Download PDF
                </button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}