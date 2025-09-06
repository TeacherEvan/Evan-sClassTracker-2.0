import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Award credits to a student
export const awardCredits = mutation({
  args: {
    studentId: v.id("students"),
    classId: v.id("classes"),
    teacherId: v.id("users"),
    creditsAwarded: v.number(),
    reason: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("enrollment"),
      v.literal("completion"),
      v.literal("achievement"),
      v.literal("adjustment")
    ),
  },
  handler: async (ctx, args) => {
    const creditId = await ctx.db.insert("credits", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });

    // Log credit award
    await ctx.db.insert("userLogs", {
      userId: args.teacherId,
      action: "credits_awarded",
      targetType: "credit",
      targetId: creditId,
      details: {
        studentId: args.studentId,
        classId: args.classId,
        credits: args.creditsAwarded,
        reason: args.reason,
      },
      timestamp: Date.now(),
    });

    // Track event
    await ctx.db.insert("events", {
      eventType: "credits_awarded",
      eventCategory: "credit",
      userId: args.teacherId,
      data: {
        creditId,
        studentId: args.studentId,
        classId: args.classId,
        credits: args.creditsAwarded,
        type: args.type,
      },
      timestamp: Date.now(),
    });

    return creditId;
  },
});

// Approve credit award
export const approveCredits = mutation({
  args: {
    creditId: v.id("credits"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const credit = await ctx.db.get(args.creditId);
    if (!credit) {
      throw new ConvexError("Credit record not found");
    }

    if (credit.status !== "pending") {
      throw new ConvexError("Credit record is not pending approval");
    }

    await ctx.db.patch(args.creditId, {
      status: "approved",
      approvedBy: args.approvedBy,
      approvedAt: Date.now(),
    });

    // Update student's total credits
    const student = await ctx.db.get(credit.studentId);
    if (student) {
      await ctx.db.patch(credit.studentId, {
        totalCredits: student.totalCredits + credit.creditsAwarded,
        updatedAt: Date.now(),
      });
    }

    // Log credit approval
    await ctx.db.insert("userLogs", {
      userId: args.approvedBy,
      action: "credits_approved",
      targetType: "credit",
      targetId: args.creditId,
      details: {
        studentId: credit.studentId,
        credits: credit.creditsAwarded,
      },
      timestamp: Date.now(),
    });

    // Track event
    await ctx.db.insert("events", {
      eventType: "credits_approved",
      eventCategory: "credit",
      userId: args.approvedBy,
      data: {
        creditId: args.creditId,
        studentId: credit.studentId,
        credits: credit.creditsAwarded,
      },
      timestamp: Date.now(),
    });

    return args.creditId;
  },
});

// Reject credit award
export const rejectCredits = mutation({
  args: {
    creditId: v.id("credits"),
    rejectedBy: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const credit = await ctx.db.get(args.creditId);
    if (!credit) {
      throw new ConvexError("Credit record not found");
    }

    if (credit.status !== "pending") {
      throw new ConvexError("Credit record is not pending approval");
    }

    await ctx.db.patch(args.creditId, {
      status: "rejected",
      approvedBy: args.rejectedBy,
      approvedAt: Date.now(),
    });

    // Log credit rejection
    await ctx.db.insert("userLogs", {
      userId: args.rejectedBy,
      action: "credits_rejected",
      targetType: "credit",
      targetId: args.creditId,
      details: {
        studentId: credit.studentId,
        credits: credit.creditsAwarded,
        reason: args.reason,
      },
      timestamp: Date.now(),
    });

    return args.creditId;
  },
});

// Get credits for a student
export const getStudentCredits = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("credits")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .collect();
  },
});

// Get credits for a class
export const getClassCredits = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("credits")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .order("desc")
      .collect();
  },
});

// Get credits by teacher
export const getTeacherCredits = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("credits")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .order("desc")
      .collect();
  },
});

// Get pending credits
export const getPendingCredits = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("credits")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

// Get credit statistics
export const getCreditStatistics = query({
  args: { 
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("credits");
    
    if (args.startDate) {
      query = query.filter((q) => q.gte(q.field("createdAt"), args.startDate!));
    }
    
    if (args.endDate) {
      query = query.filter((q) => q.lte(q.field("createdAt"), args.endDate!));
    }

    const credits = await query.collect();
    
    const stats = {
      totalCredits: credits.reduce((sum, credit) => 
        credit.status === "approved" ? sum + credit.creditsAwarded : sum, 0
      ),
      pendingCredits: credits.filter(c => c.status === "pending").length,
      approvedCredits: credits.filter(c => c.status === "approved").length,
      rejectedCredits: credits.filter(c => c.status === "rejected").length,
      totalRecords: credits.length,
    };

    return stats;
  },
});