import { useState } from 'react';

export default function Portfolio() {
  const [amount, setAmount] = useState('');
  const [portfolio, setPortfolio] = useState([
    { id: 1, tokens: 100, purchasePrice: 950 },
    { id: 2, tokens: 250, purchasePrice: 1025 }
  ]);

  const handleBuy = () => {
    if (!amount) return;
    
    setPortfolio([
      ...portfolio,
      {
        id: Date.now(),
        tokens: Number(amount),
        purchasePrice: 1000 + (Math.random() * 100)
      }
    ]);
    setAmount('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Your Portfolio</h2>
      
      <div className="mb-6">
        <div className="flex gap-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter token amount"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleBuy}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Buy Tokens
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Amount</th>
              <th className="text-left py-2">Purchase Price</th>
              <th className="text-left py-2">Current Value</th>
              <th className="text-left py-2">Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((position) => {
              const currentPrice = 1000;
              const currentValue = position.tokens * currentPrice;
              const purchaseValue = position.tokens * position.purchasePrice;
              const profitLoss = currentValue - purchaseValue;
              const profitLossPercent = ((currentValue - purchaseValue) / purchaseValue) * 100;

              return (
                <tr key={position.id} className="border-b">
                  <td className="py-2">{position.tokens}</td>
                  <td className="py-2">${position.purchasePrice.toFixed(2)}</td>
                  <td className="py-2">${currentValue.toFixed(2)}</td>
                  <td className={`py-2 ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} ({profitLossPercent.toFixed(2)}%)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}