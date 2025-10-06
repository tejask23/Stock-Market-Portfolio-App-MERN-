import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  addedAt: number;
}

interface WatchlistProps {
  stocks: Stock[];
}

export function Watchlist({ stocks }: WatchlistProps) {
  const removeFromWatchlist = useMutation(api.watchlist.removeFromWatchlist);
  const addToWatchlist = useMutation(api.watchlist.addToWatchlist);
  const [newSymbol, setNewSymbol] = useState("");

  const handleRemove = async (symbol: string) => {
    try {
      await removeFromWatchlist({ stockSymbol: symbol });
      toast.success(`Removed ${symbol} from watchlist`);
    } catch (error) {
      toast.error("Failed to remove from watchlist");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    try {
      await addToWatchlist({ stockSymbol: newSymbol.toUpperCase() });
      toast.success(`Added ${newSymbol.toUpperCase()} to watchlist`);
      setNewSymbol("");
    } catch (error) {
      toast.error("Failed to add to watchlist");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Watchlist</h3>
        
        {/* Add to watchlist form */}
        <form onSubmit={handleAdd} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            placeholder="Enter symbol (e.g., AAPL)"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      {stocks.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">👀</div>
          <p className="text-gray-500">No stocks in watchlist</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {stocks.map((stock) => {
            const change = stock.currentPrice - stock.previousClose;
            const changePercent = (change / stock.previousClose) * 100;

            return (
              <div key={stock.symbol} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{stock.symbol}</h4>
                    <p className="text-sm text-gray-500 truncate">{stock.name}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(stock.symbol)}
                    className="text-gray-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mt-2 flex justify-between items-end">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      ${stock.currentPrice.toFixed(2)}
                    </p>
                    <p className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {change >= 0 ? '+' : ''}${change.toFixed(2)} ({changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
