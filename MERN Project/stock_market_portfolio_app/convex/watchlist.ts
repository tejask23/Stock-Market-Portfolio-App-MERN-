import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserWatchlist = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const watchlistItems = await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get stock details for each watchlist item
    const stocks = [];
    for (const item of watchlistItems) {
      const stock = await ctx.db
        .query("stocks")
        .withIndex("by_symbol", (q) => q.eq("symbol", item.stockSymbol))
        .unique();
      if (stock) {
        stocks.push({
          ...stock,
          addedAt: item.addedAt,
        });
      }
    }

    return stocks;
  },
});

export const addToWatchlist = mutation({
  args: { stockSymbol: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if already in watchlist
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_stock", (q) => 
        q.eq("userId", userId).eq("stockSymbol", args.stockSymbol)
      )
      .unique();

    if (existing) {
      throw new Error("Stock already in watchlist");
    }

    await ctx.db.insert("watchlist", {
      userId,
      stockSymbol: args.stockSymbol,
      addedAt: Date.now(),
    });

    return { success: true };
  },
});

export const removeFromWatchlist = mutation({
  args: { stockSymbol: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const item = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_stock", (q) => 
        q.eq("userId", userId).eq("stockSymbol", args.stockSymbol)
      )
      .unique();

    if (!item) {
      throw new Error("Stock not in watchlist");
    }

    await ctx.db.delete(item._id);
    return { success: true };
  },
});
