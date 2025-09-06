import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Create a new user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("moderator"), v.literal("teacher")),
    passwordHash: v.string(),
    phoneNumber: v.optional(v.string()),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("User with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });

    // Log user creation
    await ctx.db.insert("userLogs", {
      userId,
      action: "user_created",
      targetType: "user",
      targetId: userId,
      timestamp: Date.now(),
    });

    return userId;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user profile
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    department: v.optional(v.string()),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    const existingUser = await ctx.db.get(userId);
    if (!existingUser) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(userId, updates);

    // Log user update
    await ctx.db.insert("userLogs", {
      userId,
      action: "user_updated",
      targetType: "user",
      targetId: userId,
      details: {
        before: existingUser,
        after: { ...existingUser, ...updates },
      },
      timestamp: Date.now(),
    });

    return userId;
  },
});

// Get users by role
export const getUsersByRole = query({
  args: { role: v.union(v.literal("admin"), v.literal("moderator"), v.literal("teacher")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Update last login
export const updateLastLogin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastLogin: Date.now(),
    });

    // Log login event
    await ctx.db.insert("events", {
      eventType: "user_login",
      eventCategory: "auth",
      userId: args.userId,
      timestamp: Date.now(),
    });
  },
});

// Deactivate user
export const deactivateUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db.get(args.userId);
    if (!existingUser) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(args.userId, { isActive: false });

    // Log user deactivation
    await ctx.db.insert("userLogs", {
      userId: args.userId,
      action: "user_deactivated",
      targetType: "user",
      targetId: args.userId,
      timestamp: Date.now(),
    });

    return args.userId;
  },
});