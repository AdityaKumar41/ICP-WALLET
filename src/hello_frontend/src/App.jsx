import React, { useState } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../declarations/hello_backend/hello_backend.did.js';
import toast, { Toaster } from 'react-hot-toast';

// Create an agent instance
const agent = new HttpAgent({
  host: 'http://127.0.0.1:4943/?canisterId=be2us-64aaa-aaaaa-qaabq-cai&id=bkyz2-fmaaa-aaaaa-qaaaq-cai', // Ensure this matches your local dfx configuration
});
agent.fetchRootKey();

// Create the wallet actor instance
const walletActor = Actor.createActor(idlFactory, {
    agent,
    canisterId: process.env.CANISTER_ID_HELLO_BACKEND, // Ensure this is set correctly
});

function App() {
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);

    const addressCopy = 'bef7d0faa9003d9a125fe02223aa9bc63f0654c2eadaebc5596d8084fcaa9f3b';

    const fetchBalance = async () => {
        if (!address) {
            toast.error("Wallet address is required.");
            return;
        }
        try {
            const balance = await walletActor.get_balance(address);
            setBalance(balance);
            toast.success("Balance fetched successfully!");
        } catch (error) {
            console.error('Error fetching balance:', error);
            toast.error("Error fetching balance. Please check the address and try again.");
        }
    };

    const handleSendTokens = async () => {
        if (!address) {
            toast.error("Wallet address is required to send tokens.");
            return;
        }
        if (amount <= 0) {
            toast.error("Enter a valid amount greater than zero.");
            return;
        }
        const toAddress = prompt("Enter the recipient's address");
        if (!toAddress) {
            toast.error("Recipient address is required.");
            return;
        }

        try {
            await walletActor.send_tokens(address, toAddress, amount);
            toast.success("Tokens sent successfully!");
            fetchBalance();
        } catch (error) {
            console.error('Error sending tokens:', error);
            toast.error("Error sending tokens. Please try again.");
        }
    };

    const handleReceiveTokens = async () => {
        if (!address) {
            toast.error("Wallet address is required to receive tokens.");
            return;
        }
        if (amount <= 0) {
            toast.error("Enter a valid amount greater than zero.");
            return;
        }

        try {
            await walletActor.receive_tokens(address, amount);
            toast.success("Tokens received successfully!");
            fetchBalance();
        } catch (error) {
            console.error('Error receiving tokens:', error);
            toast.error("Error receiving tokens. Please try again.");
        }
    };

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(addressCopy);
        toast.success("Address copied to clipboard!");
    };

    return (
        <div className="wallet-container">
            <Toaster /> {/* Display toast notifications */}
            <img src="/favicon.ico" alt="logo" />
            <h1 className="wallet-title">ICP Token Wallet</h1>
            <div className="balance-section">
                <input
                    className="input-field"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Wallet Address"
                    required
                />
                <button className="button" onClick={fetchBalance}>Get Balance</button>
                <h2 className="balance-display">Balance: {Number(balance)}</h2>
            </div>
            <div className="transaction-section">
                <input
                    className="input-field"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Amount"
                />
                <button className="button" onClick={handleSendTokens}>Send Tokens</button>
                <button className="button" onClick={handleReceiveTokens}>Receive Tokens</button>
            </div>
            <div className="address-container">
  <p className="address-label">Sample Address:</p>
  <p className="address" onClick={handleCopyAddress}>
    <img src="/copy-icon.svg" alt="copy" className='copy-icon' />
    {addressCopy.slice(0, 6)}...{addressCopy.slice(-6)}
  </p>
</div>

        </div>
    );
}

export default App;
