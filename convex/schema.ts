import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("moderator"), v.literal("teacher")),
    passwordHash: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastLogin: v.optional(v.number()),
    profileImage: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    department: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Classes table
  classes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    teacherId: v.id("users"),
    subject: v.string(),
    grade: v.string(),
    room: v.optional(v.string()),
    schedule: v.object({
      dayOfWeek: v.number(), // 0-6 (Sunday-Saturday)
      startTime: v.string(), // "HH:mm"
      endTime: v.string(), // "HH:mm"
    }),
    maxStudents: v.number(),
    currentStudents: v.number(),
    creditValue: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_subject", ["subject"])
    .index("by_grade", ["grade"]),

  // Students table
  students: defineTable({
    studentId: v.string(), // School-assigned ID
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    grade: v.string(),
    parentContact: v.optional(v.string()),
    enrolledClasses: v.array(v.id("classes")),
    totalCredits: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_student_id", ["studentId"])
    .index("by_grade", ["grade"])
    .index("by_name", ["lastName", "firstName"]),

  // Messages table
  messages: defineTable({
    senderId: v.id("users"),
    receiverId: v.optional(v.id("users")), // null for broadcast messages
    classId: v.optional(v.id("classes")), // Associated class if relevant
    subject: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("direct"),
      v.literal("class_announcement"),
      v.literal("system_notification")
    ),
    isRead: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    attachments: v.optional(v.array(v.string())), // File URLs
    createdAt: v.number(),
    readAt: v.optional(v.number()),
  })
    .index("by_receiver", ["receiverId"])
    .index("by_sender", ["senderId"])
    .index("by_class", ["classId"])
    .index("by_created", ["createdAt"]),

  // Credits table - Track credit transactions and history
  credits: defineTable({
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
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    approvedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    approvedAt: v.optional(v.number()),
  })
    .index("by_student", ["studentId"])
    .index("by_class", ["classId"])
    .index("by_teacher", ["teacherId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // User Logs table - For activity tracking
  userLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    targetType: v.optional(v.string()), // "user", "class", "student", "message", "credit"
    targetId: v.optional(v.string()),
    details: v.optional(v.object({
      before: v.optional(v.any()),
      after: v.optional(v.any()),
      metadata: v.optional(v.any()),
    })),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"])
    .index("by_target", ["targetType", "targetId"]),

  // Event Tracker table - For system events and analytics
  events: defineTable({
    eventType: v.string(),
    eventCategory: v.string(), // "auth", "class", "student", "message", "credit", "system"
    userId: v.optional(v.id("users")),
    sessionId: v.optional(v.string()),
    data: v.optional(v.any()),
    metadata: v.optional(v.object({
      browser: v.optional(v.string()),
      device: v.optional(v.string()),
      location: v.optional(v.string()),
      duration: v.optional(v.number()),
    })),
    timestamp: v.number(),
  })
    .index("by_type", ["eventType"])
    .index("by_category", ["eventCategory"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_session", ["sessionId"]),
});