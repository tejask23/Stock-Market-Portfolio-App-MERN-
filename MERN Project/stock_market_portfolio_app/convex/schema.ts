import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  portfolios: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    totalValue: v.number(),
    totalInvestment: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  stocks: defineTable({
    symbol: v.string(),
    name: v.string(),
    currentPrice: v.number(),
    previousClose: v.number(),
    marketCap: v.optional(v.number()),
    volume: v.optional(v.number()),
    lastUpdated: v.number(),
  }).index("by_symbol", ["symbol"]),

  holdings: defineTable({
    portfolioId: v.id("portfolios"),
    stockSymbol: v.string(),
    quantity: v.number(),
    averagePrice: v.number(),
    totalInvestment: v.number(),
    currentValue: v.number(),
    addedAt: v.number(),
  }).index("by_portfolio", ["portfolioId"])
    .index("by_portfolio_and_stock", ["portfolioId", "stockSymbol"]),

  transactions: defineTable({
    portfolioId: v.id("portfolios"),
    stockSymbol: v.string(),
    type: v.union(v.literal("buy"), v.literal("sell")),
    quantity: v.number(),
    price: v.number(),
    totalAmount: v.number(),
    timestamp: v.number(),
  }).index("by_portfolio", ["portfolioId"])
    .index("by_portfolio_and_stock", ["portfolioId", "stockSymbol"]),

  watchlist: defineTable({
    userId: v.id("users"),
    stockSymbol: v.string(),
    addedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_and_stock", ["userId", "stockSymbol"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
