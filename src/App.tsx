import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster } from 'react-hot-toast';
import AdminPanel from './components/AdminPanel';
import TokenStats from './components/TokenStats';
import PriceChart from './components/PriceChart';
import Portfolio from './components/Portfolio';
import TransferForm from './components/TransferForm';
import WalletConnect from './components/WalletConnect';
import { getTokenContract } from './contracts';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    if (account) {
      checkAdmin();
      updateBalance();
    }
  }, [account]);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  }

  async function checkAdmin() {
    try {
      if (!account) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = getTokenContract(provider);
      const adminAddress = await contract.admin();
      setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error('Failed to check admin status:', error);
    }
  }

  async function updateBalance() {
    try {
      if (!account) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = getTokenContract(provider);
      const balance = await contract.balanceOf(account);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  }

  async function connectWallet() {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setAccount(accounts[0]);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DemoToken (DTK)</h1>
              {account && (
                <p className="text-sm text-gray-600">Balance: {balance} DTK</p>
              )}
            </div>
            <WalletConnect account={account} onConnect={connectWallet} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <TokenStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PriceChart />
            <Portfolio />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TransferForm />
            {isAdmin && <AdminPanel />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;