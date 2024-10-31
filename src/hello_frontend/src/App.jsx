import React, { useState } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import walletIdl from '../../hello_backend/hello_backend.did';

const agent = new HttpAgent();
const walletActor = Actor.createActor(walletIdl, {
    agent,
    canisterId: "bkyz2-fmaaa-aaaaa-qaaaq-cai", // Use environment variable for canister ID
});

function App() {
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);
    const [message, setMessage] = useState('');

    const fetchBalance = async () => {
        try {
            const balance = await walletActor.get_balance(address);
            setBalance(balance);
        } catch (error) {
            console.error(error);
            setMessage('Error fetching balance.');
        }
    };

    const handleSendTokens = async () => {
        const fromAddress = address; // Assuming the user is sending from their address
        const toAddress = prompt("Enter the recipient's address");
        try {
            await walletActor.send_tokens(fromAddress, toAddress, amount);
            setMessage('Tokens sent successfully!');
            fetchBalance(); // Refresh balance after sending
        } catch (error) {
            console.error(error);
            setMessage(error.toString());
        }
    };

    const handleReceiveTokens = async () => {
        try {
            await walletActor.receive_tokens(address, amount);
            setMessage('Tokens received successfully!');
            fetchBalance(); // Refresh balance after receiving
        } catch (error) {
            console.error(error);
            setMessage(error.toString());
        }
    };

    return (
        <div>
            <h1>ICP Token Wallet</h1>
            <div>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Wallet Address"
                />
                <button onClick={fetchBalance}>Get Balance</button>
                <h2>Balance: {balance}</h2>
            </div>
            <div>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Amount"
                />
                <button onClick={handleSendTokens}>Send Tokens</button>
                <button onClick={handleReceiveTokens}>Receive Tokens</button>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
}

export default App;
