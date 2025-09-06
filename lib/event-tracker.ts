// Event tracking utility
// This would integrate with Convex when backend is running

export interface EventData {
  eventType: string
  eventCategory: 'auth' | 'class' | 'student' | 'message' | 'credit' | 'system'
  userId?: string
  sessionId?: string
  data?: Record<string, any>
  metadata?: {
    browser?: string
    device?: string
    location?: string
    duration?: number
  }
  timestamp?: number // Make optional since we add it later
}

export interface UserLogData {
  userId: string
  action: string
  targetType?: 'user' | 'class' | 'student' | 'message' | 'credit'
  targetId?: string
  details?: {
    before?: any
    after?: any
    metadata?: any
  }
  ipAddress?: string
  userAgent?: string
  timestamp?: number // Make optional since we add it later
}

class EventTracker {
  private sessionId: string
  private userId?: string
  private events: EventData[] = []
  private userLogs: UserLogData[] = []

  constructor() {
    this.sessionId = this.generateSessionId()
    
    // Track page load event
    this.trackEvent({
      eventType: 'page_load',
      eventCategory: 'system',
      metadata: {
        browser: this.getBrowserInfo(),
        device: this.getDeviceInfo(),
      }
    })
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getBrowserInfo(): string {
    if (typeof window === 'undefined') return 'server'
    return navigator.userAgent
  }

  private getDeviceInfo(): string {
    if (typeof window === 'undefined') return 'server'
    
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  setUserId(userId: string) {
    this.userId = userId
    this.trackEvent({
      eventType: 'user_identified',
      eventCategory: 'auth',
      userId,
    })
  }

  trackEvent(eventData: Omit<EventData, 'timestamp'>) {
    const event: EventData = {
      ...eventData,
      userId: eventData.userId || this.userId,
      sessionId: eventData.sessionId || this.sessionId,
    }

    this.events.push(event)
    
    // In production, this would send to Convex
    console.log('Event tracked:', event)
    
    // Store in localStorage for demo purposes
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tracked_events') || '[]'
      const events = JSON.parse(stored)
      events.push({ ...event, timestamp: Date.now() })
      localStorage.setItem('tracked_events', JSON.stringify(events.slice(-100))) // Keep last 100
    }
  }

  logUserAction(logData: Omit<UserLogData, 'timestamp'>) {
    const log: UserLogData = {
      ...logData,
      ipAddress: 'localhost', // In production, get real IP
      userAgent: this.getBrowserInfo(),
    }

    this.userLogs.push(log)
    
    // In production, this would send to Convex
    console.log('User action logged:', log)
    
    // Store in localStorage for demo purposes
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_logs') || '[]'
      const logs = JSON.parse(stored)
      logs.push({ ...log, timestamp: Date.now() })
      localStorage.setItem('user_logs', JSON.stringify(logs.slice(-100))) // Keep last 100
    }
  }

  // Track common events
  trackLogin(userId: string) {
    this.setUserId(userId)
    this.trackEvent({
      eventType: 'user_login',
      eventCategory: 'auth',
      userId,
    })
  }

  trackLogout() {
    this.trackEvent({
      eventType: 'user_logout',
      eventCategory: 'auth',
      userId: this.userId,
    })
    this.userId = undefined
  }

  trackPageView(path: string) {
    this.trackEvent({
      eventType: 'page_view',
      eventCategory: 'system',
      data: { path },
    })
  }

  trackClassCreated(classId: string, classData: any) {
    this.trackEvent({
      eventType: 'class_created',
      eventCategory: 'class',
      data: { classId, ...classData },
    })
    
    this.logUserAction({
      userId: this.userId!,
      action: 'class_created',
      targetType: 'class',
      targetId: classId,
      details: { after: classData },
    })
  }

  trackStudentEnrolled(studentId: string, classId: string) {
    this.trackEvent({
      eventType: 'student_enrolled',
      eventCategory: 'student',
      data: { studentId, classId },
    })
    
    this.logUserAction({
      userId: this.userId!,
      action: 'student_enrolled',
      targetType: 'student',
      targetId: studentId,
      details: { metadata: { classId } },
    })
  }

  trackCreditAwarded(creditId: string, studentId: string, amount: number) {
    this.trackEvent({
      eventType: 'credit_awarded',
      eventCategory: 'credit',
      data: { creditId, studentId, amount },
    })
    
    this.logUserAction({
      userId: this.userId!,
      action: 'credit_awarded',
      targetType: 'credit',
      targetId: creditId,
      details: { metadata: { studentId, amount } },
    })
  }

  trackMessageSent(messageId: string, receiverId: string, type: string) {
    this.trackEvent({
      eventType: 'message_sent',
      eventCategory: 'message',
      data: { messageId, receiverId, type },
    })
    
    this.logUserAction({
      userId: this.userId!,
      action: 'message_sent',
      targetType: 'message',
      targetId: messageId,
      details: { metadata: { receiverId, type } },
    })
  }

  // Get stored events for analytics (demo purposes)
  getStoredEvents(): EventData[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('tracked_events') || '[]'
    return JSON.parse(stored)
  }

  // Get stored user logs for audit trail (demo purposes)
  getStoredUserLogs(): UserLogData[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('user_logs') || '[]'
    return JSON.parse(stored)
  }

  // Clear stored data
  clearStoredData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tracked_events')
      localStorage.removeItem('user_logs')
    }
    this.events = []
    this.userLogs = []
  }
}

// Export singleton instance
export const eventTracker = new EventTracker()

// Export hook for React components
export function useEventTracker() {
  return {
    trackEvent: eventTracker.trackEvent.bind(eventTracker),
    logUserAction: eventTracker.logUserAction.bind(eventTracker),
    trackLogin: eventTracker.trackLogin.bind(eventTracker),
    trackLogout: eventTracker.trackLogout.bind(eventTracker),
    trackPageView: eventTracker.trackPageView.bind(eventTracker),
    trackClassCreated: eventTracker.trackClassCreated.bind(eventTracker),
    trackStudentEnrolled: eventTracker.trackStudentEnrolled.bind(eventTracker),
    trackCreditAwarded: eventTracker.trackCreditAwarded.bind(eventTracker),
    trackMessageSent: eventTracker.trackMessageSent.bind(eventTracker),
    getStoredEvents: eventTracker.getStoredEvents.bind(eventTracker),
    getStoredUserLogs: eventTracker.getStoredUserLogs.bind(eventTracker),
    clearStoredData: eventTracker.clearStoredData.bind(eventTracker),
  }
}