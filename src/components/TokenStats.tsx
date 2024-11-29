import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export default function TokenStats() {
  const stats = [
    { name: 'Market Cap', value: '$10.5M', change: 2.5 },
    { name: '24h Volume', value: '$1.2M', change: -1.8 },
    { name: 'Holders', value: '2,345', change: 5.4 },
    { name: 'Total Supply', value: '1,000,000', change: 0 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-500">{stat.name}</div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
            {stat.change !== 0 && (
              <div className={`flex items-center ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change > 0 ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                <span className="ml-1">{Math.abs(stat.change)}%</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}