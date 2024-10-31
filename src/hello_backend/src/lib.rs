use ic_cdk::export::candid::{CandidType, Deserialize};
use ic_cdk_macros::{query, update};
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone, Debug)]
struct Wallet {
    balance: u64,
}

type Address = String;
static mut WALLETS: Option<HashMap<Address, Wallet>> = None;

// Initialize the wallet map
#[ic_cdk_macros::init]
fn init() {
    unsafe {
        WALLETS = Some(HashMap::new());
    }
}

// Fetch the balance of a wallet
#[query]
fn get_balance(address: Address) -> u64 {
    let wallets = unsafe { WALLETS.as_ref().unwrap() };
    wallets.get(&address).map_or(0, |wallet| wallet.balance)
}

// Send tokens to another address
#[update]
fn send_tokens(from: Address, to: Address, amount: u64) -> Result<(), String> {
    let wallets = unsafe { WALLETS.as_mut().unwrap() };

    // Check if the sender has enough balance
    if let Some(sender_wallet) = wallets.get_mut(&from) {
        if sender_wallet.balance < amount {
            return Err("Insufficient balance".to_string());
        }
        sender_wallet.balance -= amount;

        // Add tokens to the receiver's wallet
        let receiver_wallet = wallets.entry(to.clone()).or_insert(Wallet { balance: 0 });
        receiver_wallet.balance += amount;

        Ok(())
    } else {
        Err("Sender wallet not found".to_string())
    }
}

// Receive tokens by updating the balance
#[update]
fn receive_tokens(address: Address, amount: u64) -> Result<(), String> {
    let wallets = unsafe { WALLETS.as_mut().unwrap() };
    let wallet = wallets.entry(address).or_insert(Wallet { balance: 0 });
    wallet.balance += amount;
    Ok(())
}
