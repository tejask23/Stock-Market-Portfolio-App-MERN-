import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getStock = query({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    const stock = await ctx.db
      .query("stocks")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .unique();

    return stock;
  },
});

export const getStocks = query({
  args: { symbols: v.array(v.string()) },
  handler: async (ctx, args) => {
    const stocks = [];
    for (const symbol of args.symbols) {
      const stock = await ctx.db
        .query("stocks")
        .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
        .unique();
      if (stock) {
        stocks.push(stock);
      }
    }
    return stocks;
  },
});

export const updateStock = mutation({
  args: {
    symbol: v.string(),
    name: v.string(),
    currentPrice: v.number(),
    previousClose: v.number(),
    marketCap: v.optional(v.number()),
    volume: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existingStock = await ctx.db
      .query("stocks")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .unique();

    if (existingStock) {
      await ctx.db.patch(existingStock._id, {
        name: args.name,
        currentPrice: args.currentPrice,
        previousClose: args.previousClose,
        marketCap: args.marketCap,
        volume: args.volume,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("stocks", {
        symbol: args.symbol,
        name: args.name,
        currentPrice: args.currentPrice,
        previousClose: args.previousClose,
        marketCap: args.marketCap,
        volume: args.volume,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Initialize with example stock data
export const initializeExampleStocks = mutation({
  args: {},
  handler: async (ctx) => {
    const exampleStocks = [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        currentPrice: 175.43,
        previousClose: 173.50,
        marketCap: 2800000000000,
        volume: 45000000,
      },
      {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        currentPrice: 142.56,
        previousClose: 140.25,
        marketCap: 1800000000000,
        volume: 28000000,
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        currentPrice: 378.85,
        previousClose: 375.20,
        marketCap: 2900000000000,
        volume: 32000000,
      },
      {
        symbol: "TSLA",
        name: "Tesla, Inc.",
        currentPrice: 248.42,
        previousClose: 245.67,
        marketCap: 800000000000,
        volume: 55000000,
      },
      {
        symbol: "AMZN",
        name: "Amazon.com, Inc.",
        currentPrice: 155.89,
        previousClose: 153.45,
        marketCap: 1600000000000,
        volume: 38000000,
      },
    ];

    for (const stock of exampleStocks) {
      const existing = await ctx.db
        .query("stocks")
        .withIndex("by_symbol", (q) => q.eq("symbol", stock.symbol))
        .unique();

      if (!existing) {
        await ctx.db.insert("stocks", {
          ...stock,
          lastUpdated: Date.now(),
        });
      }
    }
  },
});
