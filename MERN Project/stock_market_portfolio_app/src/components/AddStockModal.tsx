import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface AddStockModalProps {
  portfolioId: Id<"portfolios">;
  onClose: () => void;
}

export function AddStockModal({ portfolioId, onClose }: AddStockModalProps) {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const addHolding = useMutation(api.holdings.addHolding);
  const stock = useQuery(api.stocks.getStock, symbol ? { symbol: symbol.toUpperCase() } : "skip");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !quantity || !price) return;

    const qty = parseInt(quantity);
    const prc = parseFloat(price);

    if (qty <= 0 || prc <= 0) {
      toast.error("Quantity and price must be positive numbers");
      return;
    }

    setIsLoading(true);
    try {
      await addHolding({
        portfolioId,
        stockSymbol: symbol.toUpperCase(),
        quantity: qty,
        price: prc,
      });
      toast.success(`Added ${qty} shares of ${symbol.toUpperCase()}`);
      onClose();
    } catch (error) {
      toast.error("Failed to add stock");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentPrice = () => {
    if (stock) {
      setPrice(stock.currentPrice.toString());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add Stock</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Symbol *
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., AAPL"
              required
            />
            {stock && (
              <p className="text-sm text-gray-600 mt-1">
                {stock.name} - Current: ${stock.currentPrice.toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Number of shares"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Share *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
              {stock && (
                <button
                  type="button"
                  onClick={handleUseCurrentPrice}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Use Current
                </button>
              )}
            </div>
          </div>

          {quantity && price && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                Total Investment: <span className="font-semibold">
                  ${(parseInt(quantity || "0") * parseFloat(price || "0")).toLocaleString()}
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !symbol.trim() || !quantity || !price}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Adding..." : "Add Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
