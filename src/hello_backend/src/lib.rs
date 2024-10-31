use ic_cdk::export::candid::{CandidType, Deserialize};
use ic_cdk_macros::{init, query, update};
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone, Debug)]
struct Wallet {
    balance: u64,
}

type Address = String;

// Thread-safe mutable storage for wallets
thread_local! {
    static WALLETS: RefCell<HashMap<Address, Wallet>> = RefCell::new(HashMap::new());
}

// Initialize the wallet map
#[init]
fn init() {
    WALLETS.with(|wallets| {
        wallets.borrow_mut().clear(); // Clear in case of re-initialization
    });
}

// Fetch the balance of a wallet
#[query]
fn get_balance(address: Address) -> u64 {
    WALLETS.with(|wallets| {
        wallets.borrow().get(&address).map_or(0, |wallet| wallet.balance)
    })
}

// Send tokens to another address
#[update]
fn send_tokens(from: Address, to: Address, amount: u64) -> Result<(), String> {
    WALLETS.with(|wallets| {
        let mut wallets = wallets.borrow_mut();

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
    })
}

// Receive tokens by updating the balance
#[update]
fn receive_tokens(address: Address, amount: u64) -> Result<(), String> {
    WALLETS.with(|wallets| {
        let mut wallets = wallets.borrow_mut();
        let wallet = wallets.entry(address).or_insert(Wallet { balance: 0 });
        wallet.balance += amount;
        Ok(())
    })
}
