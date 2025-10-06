import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { PortfolioDetails } from "./PortfolioDetails";

interface Portfolio {
  _id: Id<"portfolios">;
  name: string;
  description?: string;
  totalValue: number;
  totalInvestment: number;
  createdAt: number;
}

interface PortfolioListProps {
  portfolios: Portfolio[];
}

export function PortfolioList({ portfolios }: PortfolioListProps) {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Id<"portfolios"> | null>(null);

  if (portfolios.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolios yet</h3>
        <p className="text-gray-500">Create your first portfolio to start tracking your investments</p>
      </div>
    );
  }

  if (selectedPortfolio) {
    return (
      <PortfolioDetails 
        portfolioId={selectedPortfolio} 
        onBack={() => setSelectedPortfolio(null)} 
      />
    );
  }

  return (
    <div className="space-y-4">
      {portfolios.map((portfolio) => {
        const gainLoss = portfolio.totalValue - portfolio.totalInvestment;
        const gainLossPercent = portfolio.totalInvestment > 0 
          ? (gainLoss / portfolio.totalInvestment) * 100 
          : 0;

        return (
          <div
            key={portfolio._id}
            onClick={() => setSelectedPortfolio(portfolio._id)}
            className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{portfolio.name}</h3>
                {portfolio.description && (
                  <p className="text-gray-500 text-sm">{portfolio.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  ${portfolio.totalValue.toLocaleString()}
                </p>
                <p className={`text-sm font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString()} ({gainLossPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>Investment: ${portfolio.totalInvestment.toLocaleString()}</span>
              <span>Created: {new Date(portfolio.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
