import { eventTracker } from '@/lib/event-tracker'

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Event Tracker', () => {
  beforeEach(() => {
    localStorage.clear()
    eventTracker.clearStoredData()
  })

  describe('User Login Tracking', () => {
    it('should track user login events', () => {
      const userId = 'test-user-123'
      
      eventTracker.trackLogin(userId)
      
      const events = eventTracker.getStoredEvents()
      const loginEvent = events.find(e => e.eventType === 'user_login')
      
      expect(loginEvent).toBeDefined()
      expect(loginEvent?.userId).toBe(userId)
      expect(loginEvent?.eventCategory).toBe('auth')
    })

    it('should track user logout events', () => {
      const userId = 'test-user-123'
      
      eventTracker.trackLogin(userId)
      eventTracker.trackLogout()
      
      const events = eventTracker.getStoredEvents()
      const logoutEvent = events.find(e => e.eventType === 'user_logout')
      
      expect(logoutEvent).toBeDefined()
      expect(logoutEvent?.userId).toBe(userId)
      expect(logoutEvent?.eventCategory).toBe('auth')
    })
  })

  describe('Class Management Tracking', () => {
    it('should track class creation', () => {
      const userId = 'teacher-123'
      const classId = 'class-456'
      const classData = {
        name: 'Test Class',
        subject: 'Mathematics',
        grade: 'Grade 10'
      }
      
      eventTracker.trackLogin(userId)
      eventTracker.trackClassCreated(classId, classData)
      
      const events = eventTracker.getStoredEvents()
      const logs = eventTracker.getStoredUserLogs()
      
      // Check event tracking
      const classEvent = events.find(e => e.eventType === 'class_created')
      expect(classEvent).toBeDefined()
      expect(classEvent?.eventCategory).toBe('class')
      expect(classEvent?.data).toEqual(expect.objectContaining(classData))
      
      // Check user log
      const classLog = logs.find(l => l.action === 'class_created')
      expect(classLog).toBeDefined()
      expect(classLog?.userId).toBe(userId)
      expect(classLog?.targetType).toBe('class')
      expect(classLog?.targetId).toBe(classId)
    })
  })

  describe('Student Management Tracking', () => {
    it('should track student enrollment', () => {
      const userId = 'teacher-123'
      const studentId = 'student-789'
      const classId = 'class-456'
      
      eventTracker.trackLogin(userId)
      eventTracker.trackStudentEnrolled(studentId, classId)
      
      const events = eventTracker.getStoredEvents()
      const logs = eventTracker.getStoredUserLogs()
      
      // Check event tracking
      const enrollEvent = events.find(e => e.eventType === 'student_enrolled')
      expect(enrollEvent).toBeDefined()
      expect(enrollEvent?.eventCategory).toBe('student')
      expect(enrollEvent?.data).toEqual(expect.objectContaining({
        studentId,
        classId
      }))
      
      // Check user log
      const enrollLog = logs.find(l => l.action === 'student_enrolled')
      expect(enrollLog).toBeDefined()
      expect(enrollLog?.userId).toBe(userId)
      expect(enrollLog?.targetType).toBe('student')
    })
  })

  describe('Credit Management Tracking', () => {
    it('should track credit awards', () => {
      const userId = 'teacher-123'
      const creditId = 'credit-101'
      const studentId = 'student-789'
      const amount = 5
      
      eventTracker.trackLogin(userId)
      eventTracker.trackCreditAwarded(creditId, studentId, amount)
      
      const events = eventTracker.getStoredEvents()
      const logs = eventTracker.getStoredUserLogs()
      
      // Check event tracking
      const creditEvent = events.find(e => e.eventType === 'credit_awarded')
      expect(creditEvent).toBeDefined()
      expect(creditEvent?.eventCategory).toBe('credit')
      expect(creditEvent?.data).toEqual(expect.objectContaining({
        creditId,
        studentId,
        amount
      }))
      
      // Check user log
      const creditLog = logs.find(l => l.action === 'credit_awarded')
      expect(creditLog).toBeDefined()
      expect(creditLog?.userId).toBe(userId)
      expect(creditLog?.targetType).toBe('credit')
    })
  })

  describe('Message Tracking', () => {
    it('should track message sending', () => {
      const userId = 'teacher-123'
      const messageId = 'message-202'
      const receiverId = 'student-456'
      const type = 'direct'
      
      eventTracker.trackLogin(userId)
      eventTracker.trackMessageSent(messageId, receiverId, type)
      
      const events = eventTracker.getStoredEvents()
      const logs = eventTracker.getStoredUserLogs()
      
      // Check event tracking
      const messageEvent = events.find(e => e.eventType === 'message_sent')
      expect(messageEvent).toBeDefined()
      expect(messageEvent?.eventCategory).toBe('message')
      expect(messageEvent?.data).toEqual(expect.objectContaining({
        messageId,
        receiverId,
        type
      }))
      
      // Check user log
      const messageLog = logs.find(l => l.action === 'message_sent')
      expect(messageLog).toBeDefined()
      expect(messageLog?.userId).toBe(userId)
      expect(messageLog?.targetType).toBe('message')
    })
  })

  describe('Page View Tracking', () => {
    it('should track page views', () => {
      const path = '/dashboard'
      
      eventTracker.trackPageView(path)
      
      const events = eventTracker.getStoredEvents()
      const pageViewEvent = events.find(e => e.eventType === 'page_view')
      
      expect(pageViewEvent).toBeDefined()
      expect(pageViewEvent?.eventCategory).toBe('system')
      expect(pageViewEvent?.data).toEqual(expect.objectContaining({ path }))
    })
  })

  describe('Data Persistence', () => {
    it('should persist events to localStorage', () => {
      eventTracker.trackPageView('/test')
      
      const storedEvents = localStorage.getItem('tracked_events')
      expect(storedEvents).toBeTruthy()
      
      const parsedEvents = JSON.parse(storedEvents!)
      expect(parsedEvents.length).toBeGreaterThan(0)
      expect(parsedEvents.some((e: any) => e.eventType === 'page_view')).toBe(true)
    })

    it('should persist user logs to localStorage', () => {
      eventTracker.logUserAction({
        userId: 'test-user',
        action: 'test_action'
      })
      
      const storedLogs = localStorage.getItem('user_logs')
      expect(storedLogs).toBeTruthy()
      
      const parsedLogs = JSON.parse(storedLogs!)
      expect(parsedLogs).toHaveLength(1)
      expect(parsedLogs[0].action).toBe('test_action')
    })

    it('should clear stored data', () => {
      eventTracker.trackPageView('/test')
      eventTracker.logUserAction({
        userId: 'test-user',
        action: 'test_action'
      })
      
      expect(eventTracker.getStoredEvents().length).toBeGreaterThan(0)
      expect(eventTracker.getStoredUserLogs().length).toBeGreaterThan(0)
      
      eventTracker.clearStoredData()
      
      expect(eventTracker.getStoredEvents().length).toBe(0)
      expect(eventTracker.getStoredUserLogs().length).toBe(0)
    })
  })

  describe('Session Tracking', () => {
    it('should generate unique session IDs', () => {
      eventTracker.trackPageView('/test1')
      eventTracker.trackPageView('/test2')
      
      const events = eventTracker.getStoredEvents()
      const sessionIds = events.map(e => e.sessionId).filter(Boolean)
      
      expect(sessionIds.length).toBeGreaterThan(0)
      // All events in the same test should have the same session ID
      expect(new Set(sessionIds).size).toBe(1)
    })
  })
})