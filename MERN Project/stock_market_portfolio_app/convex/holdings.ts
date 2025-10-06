import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addHolding = mutation({
  args: {
    portfolioId: v.id("portfolios"),
    stockSymbol: v.string(),
    quantity: v.number(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify portfolio ownership
    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio || portfolio.userId !== userId) {
      throw new Error("Portfolio not found");
    }

    const totalAmount = args.quantity * args.price;

    // Check if holding already exists
    const existingHolding = await ctx.db
      .query("holdings")
      .withIndex("by_portfolio_and_stock", (q) => 
        q.eq("portfolioId", args.portfolioId).eq("stockSymbol", args.stockSymbol)
      )
      .unique();

    if (existingHolding) {
      // Update existing holding
      const newQuantity = existingHolding.quantity + args.quantity;
      const newTotalInvestment = existingHolding.totalInvestment + totalAmount;
      const newAveragePrice = newTotalInvestment / newQuantity;

      await ctx.db.patch(existingHolding._id, {
        quantity: newQuantity,
        averagePrice: newAveragePrice,
        totalInvestment: newTotalInvestment,
        currentValue: newQuantity * args.price, // Will be updated with real prices later
      });
    } else {
      // Create new holding
      await ctx.db.insert("holdings", {
        portfolioId: args.portfolioId,
        stockSymbol: args.stockSymbol,
        quantity: args.quantity,
        averagePrice: args.price,
        totalInvestment: totalAmount,
        currentValue: totalAmount,
        addedAt: Date.now(),
      });
    }

    // Add transaction record
    await ctx.db.insert("transactions", {
      portfolioId: args.portfolioId,
      stockSymbol: args.stockSymbol,
      type: "buy",
      quantity: args.quantity,
      price: args.price,
      totalAmount,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const sellHolding = mutation({
  args: {
    portfolioId: v.id("portfolios"),
    stockSymbol: v.string(),
    quantity: v.number(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify portfolio ownership
    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio || portfolio.userId !== userId) {
      throw new Error("Portfolio not found");
    }

    const holding = await ctx.db
      .query("holdings")
      .withIndex("by_portfolio_and_stock", (q) => 
        q.eq("portfolioId", args.portfolioId).eq("stockSymbol", args.stockSymbol)
      )
      .unique();

    if (!holding) {
      throw new Error("Holding not found");
    }

    if (holding.quantity < args.quantity) {
      throw new Error("Insufficient shares to sell");
    }

    const totalAmount = args.quantity * args.price;
    const newQuantity = holding.quantity - args.quantity;

    if (newQuantity === 0) {
      // Remove holding completely
      await ctx.db.delete(holding._id);
    } else {
      // Update holding
      const soldPortion = args.quantity / holding.quantity;
      const newTotalInvestment = holding.totalInvestment * (1 - soldPortion);
      
      await ctx.db.patch(holding._id, {
        quantity: newQuantity,
        totalInvestment: newTotalInvestment,
        currentValue: newQuantity * args.price,
      });
    }

    // Add transaction record
    await ctx.db.insert("transactions", {
      portfolioId: args.portfolioId,
      stockSymbol: args.stockSymbol,
      type: "sell",
      quantity: args.quantity,
      price: args.price,
      totalAmount,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});
