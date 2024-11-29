import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const generateMockData = () => {
  const prices = [];
  let currentPrice = 1000;
  
  for (let i = 0; i < 30; i++) {
    currentPrice += (Math.random() - 0.5) * 50;
    prices.push(currentPrice);
  }
  
  return prices;
};

export default function PriceChart() {
  const data = {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'Token Price (USD)',
        data: generateMockData(),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '30 Day Price History'
      }
    }
  };

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-lg shadow-lg">
      <Line options={options} data={data} />
    </div>
  );
}