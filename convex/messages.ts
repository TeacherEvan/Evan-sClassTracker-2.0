import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Send a message
export const sendMessage = mutation({
  args: {
    senderId: v.id("users"),
    receiverId: v.optional(v.id("users")),
    classId: v.optional(v.id("classes")),
    subject: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("direct"),
      v.literal("class_announcement"),
      v.literal("system_notification")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });

    // Log message sent
    await ctx.db.insert("userLogs", {
      userId: args.senderId,
      action: "message_sent",
      targetType: "message",
      targetId: messageId,
      details: {
        receiverId: args.receiverId,
        type: args.type,
        subject: args.subject,
      },
      timestamp: Date.now(),
    });

    // Track event
    await ctx.db.insert("events", {
      eventType: "message_sent",
      eventCategory: "message",
      userId: args.senderId,
      data: {
        messageId,
        type: args.type,
        priority: args.priority,
        hasAttachments: !!args.attachments?.length,
      },
      timestamp: Date.now(),
    });

    return messageId;
  },
});

// Get messages for a user (inbox)
export const getMessagesForUser = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    return await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Get sent messages for a user
export const getSentMessages = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    return await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Get class announcements
export const getClassAnnouncements = query({
  args: { 
    classId: v.id("classes"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    return await ctx.db
      .query("messages")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => q.eq(q.field("type"), "class_announcement"))
      .order("desc")
      .take(limit);
  },
});

// Mark message as read
export const markMessageAsRead = mutation({
  args: { 
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new ConvexError("Message not found");
    }

    if (message.receiverId !== args.userId) {
      throw new ConvexError("Unauthorized to mark this message as read");
    }

    await ctx.db.patch(args.messageId, {
      isRead: true,
      readAt: Date.now(),
    });

    // Log message read
    await ctx.db.insert("userLogs", {
      userId: args.userId,
      action: "message_read",
      targetType: "message",
      targetId: args.messageId,
      timestamp: Date.now(),
    });

    return args.messageId;
  },
});

// Get unread message count
export const getUnreadMessageCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unreadMessages.length;
  },
});

// Delete message
export const deleteMessage = mutation({
  args: { 
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new ConvexError("Message not found");
    }

    // Only sender or receiver can delete
    if (message.senderId !== args.userId && message.receiverId !== args.userId) {
      throw new ConvexError("Unauthorized to delete this message");
    }

    await ctx.db.delete(args.messageId);

    // Log message deletion
    await ctx.db.insert("userLogs", {
      userId: args.userId,
      action: "message_deleted",
      targetType: "message",
      targetId: args.messageId,
      timestamp: Date.now(),
    });

    return args.messageId;
  },
});