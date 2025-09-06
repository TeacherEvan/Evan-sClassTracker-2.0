"use client"

import { useEffect } from "react"
import { useEventTracker } from "@/lib/event-tracker"

export default function TeacherDashboard() {
  const { trackPageView, trackClassCreated, trackStudentEnrolled, trackCreditAwarded } = useEventTracker()

  useEffect(() => {
    trackPageView('/teacher')
  }, [trackPageView])

  // Demo functions to show event tracking
  const handleCreateClass = () => {
    const classId = `class_${Date.now()}`
    trackClassCreated(classId, {
      name: "Advanced Mathematics",
      subject: "Mathematics",
      grade: "Grade 12"
    })
  }

  const handleEnrollStudent = () => {
    const studentId = `student_${Date.now()}`
    const classId = `class_${Date.now() - 1000}`
    trackStudentEnrolled(studentId, classId)
  }

  const handleAwardCredit = () => {
    const creditId = `credit_${Date.now()}`
    const studentId = `student_${Date.now() - 2000}`
    trackCreditAwarded(creditId, studentId, 5)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold text-navy">
          Teacher Dashboard
        </h2>
        <p className="text-navy/70 mt-2">
          Manage your classes, students, and credits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gold">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-navy/60">Total Classes</p>
              <p className="text-2xl font-bold text-navy">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-bronze">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-navy/60">Total Students</p>
              <p className="text-2xl font-bold text-navy">156</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-silver">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-navy/60">Credits Awarded</p>
              <p className="text-2xl font-bold text-navy">1,247</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Actions for Event Tracking */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-navy">Quick Actions</h3>
          <p className="text-sm text-navy/60">Test event tracking functionality</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleCreateClass}
              className="bg-gold hover:bg-gold/90 text-navy px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Create Demo Class
            </button>
            <button
              onClick={handleEnrollStudent}
              className="bg-bronze hover:bg-bronze/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Enroll Demo Student
            </button>
            <button
              onClick={handleAwardCredit}
              className="bg-silver hover:bg-silver/90 text-navy px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Award Demo Credit
            </button>
          </div>
          <p className="text-xs text-navy/60 mt-3">
            Click these buttons to generate sample events. Check the Admin Dashboard to see logged activities.
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-navy">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gold rounded-full"></div>
              <p className="text-sm text-navy/80">
                Created new class: Advanced Mathematics
              </p>
              <span className="text-xs text-navy/50">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-bronze rounded-full"></div>
              <p className="text-sm text-navy/80">
                Awarded 5 credits to John Smith
              </p>
              <span className="text-xs text-navy/50">4 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-silver rounded-full"></div>
              <p className="text-sm text-navy/80">
                Sent announcement to Physics 101 class
              </p>
              <span className="text-xs text-navy/50">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}