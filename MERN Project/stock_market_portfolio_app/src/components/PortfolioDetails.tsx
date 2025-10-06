import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { AddStockModal } from "./AddStockModal";
import { toast } from "sonner";

interface PortfolioDetailsProps {
  portfolioId: Id<"portfolios">;
  onBack: () => void;
}

export function PortfolioDetails({ portfolioId, onBack }: PortfolioDetailsProps) {
  const portfolioData = useQuery(api.portfolios.getPortfolioDetails, { portfolioId });
  const sellHolding = useMutation(api.holdings.sellHolding);
  const [showAddStock, setShowAddStock] = useState(false);
  const [sellQuantity, setSellQuantity] = useState<Record<string, number>>({});

  if (!portfolioData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { portfolio, holdings, transactions } = portfolioData;

  const handleSell = async (stockSymbol: string, maxQuantity: number, currentPrice: number) => {
    const quantity = sellQuantity[stockSymbol];
    if (!quantity || quantity <= 0 || quantity > maxQuantity) {
      toast.error("Invalid quantity");
      return;
    }

    try {
      await sellHolding({
        portfolioId,
        stockSymbol,
        quantity,
        price: currentPrice,
      });
      toast.success(`Sold ${quantity} shares of ${stockSymbol}`);
      setSellQuantity(prev => ({ ...prev, [stockSymbol]: 0 }));
    } catch (error) {
      toast.error("Failed to sell stock");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{portfolio.name}</h2>
            {portfolio.description && (
              <p className="text-gray-500">{portfolio.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddStock(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Stock
        </button>
      </div>

      {/* Holdings */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Holdings</h3>
        </div>
        
        {holdings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📈</div>
            <p className="text-gray-500">No holdings yet. Add your first stock to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gain/Loss</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {holdings.map((holding) => {
                  const gainLoss = holding.currentValue - holding.totalInvestment;
                  const gainLossPercent = (gainLoss / holding.totalInvestment) * 100;
                  const currentPrice = holding.currentValue / holding.quantity;

                  return (
                    <tr key={holding._id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {holding.stockSymbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {holding.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        ${holding.averagePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        ${holding.currentValue.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString()} ({gainLossPercent.toFixed(2)}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max={holding.quantity}
                            value={sellQuantity[holding.stockSymbol] || ''}
                            onChange={(e) => setSellQuantity(prev => ({
                              ...prev,
                              [holding.stockSymbol]: parseInt(e.target.value) || 0
                            }))}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            placeholder="Qty"
                          />
                          <button
                            onClick={() => handleSell(holding.stockSymbol, holding.quantity, currentPrice)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.type === 'buy' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {transaction.stockSymbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      ${transaction.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      ${transaction.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddStock && (
        <AddStockModal 
          portfolioId={portfolioId}
          onClose={() => setShowAddStock(false)} 
        />
      )}
    </div>
  );
}
