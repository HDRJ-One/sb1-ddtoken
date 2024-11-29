import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getTokenContract } from '../contracts';
import toast from 'react-hot-toast';

export default function TransferForm() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!recipient || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getTokenContract(signer);
      
      const tx = await contract.transfer(recipient, ethers.parseEther(amount));
      await tx.wait();
      
      toast.success('Transfer successful!');
      setRecipient('');
      setAmount('');
    } catch (error) {
      console.error('Transfer failed:', error);
      toast.error('Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Transfer Tokens</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="0x..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="0.0"
          />
        </div>
        <button
          onClick={handleTransfer}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Transfer'}
        </button>
      </div>
    </div>
  );
}