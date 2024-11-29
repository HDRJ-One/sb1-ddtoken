import React from 'react';

interface WalletConnectProps {
  account: string;
  onConnect: () => void;
}

export default function WalletConnect({ account, onConnect }: WalletConnectProps) {
  return (
    <button
      onClick={onConnect}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
    </button>
  );
}