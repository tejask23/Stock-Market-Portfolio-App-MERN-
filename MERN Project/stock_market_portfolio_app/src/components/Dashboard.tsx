import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PortfolioList } from "./PortfolioList";
import { Watchlist } from "./Watchlist";
import { CreatePortfolioModal } from "./CreatePortfolioModal";
import { useState, useEffect } from "react";

export function Dashboard() {
  const portfolios = useQuery(api.portfolios.getUserPortfolios);
  const watchlist = useQuery(api.watchlist.getUserWatchlist);
  const initializeStocks = useMutation(api.stocks.initializeExampleStocks);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Initialize example stocks on first load
  useEffect(() => {
    initializeStocks();
  }, [initializeStocks]);

  if (portfolios === undefined || watchlist === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalPortfolioValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
  const totalInvestment = portfolios.reduce((sum, p) => sum + p.totalInvestment, 0);
  const totalGainLoss = totalPortfolioValue - totalInvestment;
  const totalGainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Portfolio Value</h3>
          <p className="text-2xl font-bold text-gray-900">${totalPortfolioValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Investment</h3>
          <p className="text-2xl font-bold text-gray-900">${totalInvestment.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Gain/Loss</h3>
          <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${totalGainLoss.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Return %</h3>
          <p className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalGainLossPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Portfolios */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Portfolios</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Portfolio
            </button>
          </div>
          <PortfolioList portfolios={portfolios} />
        </div>

        {/* Watchlist */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Watchlist</h2>
          <Watchlist stocks={watchlist} />
        </div>
      </div>

      {showCreateModal && (
        <CreatePortfolioModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
