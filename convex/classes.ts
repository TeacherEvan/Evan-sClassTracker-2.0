import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Create a new class
export const createClass = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    teacherId: v.id("users"),
    subject: v.string(),
    grade: v.string(),
    room: v.optional(v.string()),
    schedule: v.object({
      dayOfWeek: v.number(),
      startTime: v.string(),
      endTime: v.string(),
    }),
    maxStudents: v.number(),
    creditValue: v.number(),
  },
  handler: async (ctx, args) => {
    const classId = await ctx.db.insert("classes", {
      ...args,
      currentStudents: 0,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log class creation
    await ctx.db.insert("userLogs", {
      userId: args.teacherId,
      action: "class_created",
      targetType: "class",
      targetId: classId,
      timestamp: Date.now(),
    });

    // Track event
    await ctx.db.insert("events", {
      eventType: "class_created",
      eventCategory: "class",
      userId: args.teacherId,
      data: { classId, subject: args.subject, grade: args.grade },
      timestamp: Date.now(),
    });

    return classId;
  },
});

// Get classes by teacher
export const getClassesByTeacher = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("classes")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get all classes
export const getAllClasses = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("classes")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get class by ID
export const getClassById = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.classId);
  },
});

// Update class
export const updateClass = mutation({
  args: {
    classId: v.id("classes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    subject: v.optional(v.string()),
    grade: v.optional(v.string()),
    room: v.optional(v.string()),
    schedule: v.optional(v.object({
      dayOfWeek: v.number(),
      startTime: v.string(),
      endTime: v.string(),
    })),
    maxStudents: v.optional(v.number()),
    creditValue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { classId, ...updates } = args;
    
    const existingClass = await ctx.db.get(classId);
    if (!existingClass) {
      throw new ConvexError("Class not found");
    }

    await ctx.db.patch(classId, {
      ...updates,
      updatedAt: Date.now(),
    });

    // Log class update
    await ctx.db.insert("userLogs", {
      userId: existingClass.teacherId,
      action: "class_updated",
      targetType: "class",
      targetId: classId,
      details: {
        before: existingClass,
        after: { ...existingClass, ...updates },
      },
      timestamp: Date.now(),
    });

    return classId;
  },
});

// Get classes by subject
export const getClassesBySubject = query({
  args: { subject: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("classes")
      .withIndex("by_subject", (q) => q.eq("subject", args.subject))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get classes by grade
export const getClassesByGrade = query({
  args: { grade: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("classes")
      .withIndex("by_grade", (q) => q.eq("grade", args.grade))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Delete class (soft delete)
export const deleteClass = mutation({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    const existingClass = await ctx.db.get(args.classId);
    if (!existingClass) {
      throw new ConvexError("Class not found");
    }

    await ctx.db.patch(args.classId, { isActive: false });

    // Log class deletion
    await ctx.db.insert("userLogs", {
      userId: existingClass.teacherId,
      action: "class_deleted",
      targetType: "class",
      targetId: args.classId,
      timestamp: Date.now(),
    });

    return args.classId;
  },
});