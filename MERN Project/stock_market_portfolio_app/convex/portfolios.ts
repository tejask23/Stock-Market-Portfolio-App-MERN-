import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserPortfolios = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const portfolios = await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return portfolios;
  },
});

export const getPortfolioDetails = query({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio || portfolio.userId !== userId) {
      throw new Error("Portfolio not found");
    }

    const holdings = await ctx.db
      .query("holdings")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .order("desc")
      .take(20);

    return {
      portfolio,
      holdings,
      transactions,
    };
  },
});

export const createPortfolio = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const portfolioId = await ctx.db.insert("portfolios", {
      userId,
      name: args.name,
      description: args.description,
      totalValue: 0,
      totalInvestment: 0,
      createdAt: Date.now(),
    });

    return portfolioId;
  },
});

export const updatePortfolioValue = mutation({
  args: {
    portfolioId: v.id("portfolios"),
    totalValue: v.number(),
    totalInvestment: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio || portfolio.userId !== userId) {
      throw new Error("Portfolio not found");
    }

    await ctx.db.patch(args.portfolioId, {
      totalValue: args.totalValue,
      totalInvestment: args.totalInvestment,
    });
  },
});
