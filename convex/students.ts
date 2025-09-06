import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Create a new student
export const createStudent = mutation({
  args: {
    studentId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    grade: v.string(),
    parentContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if student ID already exists
    const existingStudent = await ctx.db
      .query("students")
      .withIndex("by_student_id", (q) => q.eq("studentId", args.studentId))
      .first();

    if (existingStudent) {
      throw new ConvexError("Student with this ID already exists");
    }

    const student = await ctx.db.insert("students", {
      ...args,
      enrolledClasses: [],
      totalCredits: 0,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log student creation
    await ctx.db.insert("userLogs", {
      userId: "system" as any, // System action
      action: "student_created",
      targetType: "student",
      targetId: student,
      timestamp: Date.now(),
    });

    // Track event
    await ctx.db.insert("events", {
      eventType: "student_created",
      eventCategory: "student",
      data: { studentId: args.studentId, grade: args.grade },
      timestamp: Date.now(),
    });

    return student;
  },
});

// Get student by ID
export const getStudentById = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.studentId);
  },
});

// Get student by student ID
export const getStudentByStudentId = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("students")
      .withIndex("by_student_id", (q) => q.eq("studentId", args.studentId))
      .first();
  },
});

// Get students by grade
export const getStudentsByGrade = query({
  args: { grade: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("students")
      .withIndex("by_grade", (q) => q.eq("grade", args.grade))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get all students
export const getAllStudents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("students")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Search students by name
export const searchStudentsByName = query({
  args: { 
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("students");
    
    if (args.lastName) {
      query = query.withIndex("by_name", (q) => q.eq("lastName", args.lastName));
    }
    
    return await query
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Enroll student in class
export const enrollStudentInClass = mutation({
  args: {
    studentId: v.id("students"),
    classId: v.id("classes"),
    enrolledBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    const classInfo = await ctx.db.get(args.classId);

    if (!student || !classInfo) {
      throw new ConvexError("Student or class not found");
    }

    if (student.enrolledClasses.includes(args.classId)) {
      throw new ConvexError("Student is already enrolled in this class");
    }

    if (classInfo.currentStudents >= classInfo.maxStudents) {
      throw new ConvexError("Class is full");
    }

    // Update student's enrolled classes
    await ctx.db.patch(args.studentId, {
      enrolledClasses: [...student.enrolledClasses, args.classId],
      updatedAt: Date.now(),
    });

    // Update class current students count
    await ctx.db.patch(args.classId, {
      currentStudents: classInfo.currentStudents + 1,
      updatedAt: Date.now(),
    });

    // Create credit record for enrollment
    await ctx.db.insert("credits", {
      studentId: args.studentId,
      classId: args.classId,
      teacherId: classInfo.teacherId,
      creditsAwarded: classInfo.creditValue,
      reason: "Class enrollment",
      type: "enrollment",
      status: "approved",
      approvedBy: args.enrolledBy,
      createdAt: Date.now(),
      approvedAt: Date.now(),
    });

    // Log enrollment
    await ctx.db.insert("userLogs", {
      userId: args.enrolledBy,
      action: "student_enrolled",
      targetType: "student",
      targetId: args.studentId,
      details: {
        classId: args.classId,
        className: classInfo.name,
      },
      timestamp: Date.now(),
    });

    // Track event
    await ctx.db.insert("events", {
      eventType: "student_enrolled",
      eventCategory: "student",
      userId: args.enrolledBy,
      data: {
        studentId: args.studentId,
        classId: args.classId,
        subject: classInfo.subject,
      },
      timestamp: Date.now(),
    });

    return args.studentId;
  },
});

// Update student
export const updateStudent = mutation({
  args: {
    studentId: v.id("students"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    grade: v.optional(v.string()),
    parentContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { studentId, ...updates } = args;
    
    const existingStudent = await ctx.db.get(studentId);
    if (!existingStudent) {
      throw new ConvexError("Student not found");
    }

    await ctx.db.patch(studentId, {
      ...updates,
      updatedAt: Date.now(),
    });

    // Log student update
    await ctx.db.insert("userLogs", {
      userId: "system" as any,
      action: "student_updated",
      targetType: "student",
      targetId: studentId,
      details: {
        before: existingStudent,
        after: { ...existingStudent, ...updates },
      },
      timestamp: Date.now(),
    });

    return studentId;
  },
});