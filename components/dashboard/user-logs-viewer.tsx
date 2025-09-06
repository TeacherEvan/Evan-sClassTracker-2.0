"use client"

import { useState, useEffect } from "react"
import { useEventTracker } from "@/lib/event-tracker"
import { Button } from "@/components/ui/button"

interface LogEntry {
  userId?: string
  action: string
  targetType?: string
  targetId?: string
  details?: any
  timestamp: number
  ipAddress?: string
  userAgent?: string
}

interface EventEntry {
  eventType: string
  eventCategory: string
  userId?: string
  sessionId?: string
  data?: any
  metadata?: any
  timestamp: number
}

export default function UserLogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [events, setEvents] = useState<EventEntry[]>([])
  const [activeTab, setActiveTab] = useState<'logs' | 'events'>('logs')
  const { getStoredUserLogs, getStoredEvents, clearStoredData } = useEventTracker()

  useEffect(() => {
    const updateData = () => {
      const storedLogs = getStoredUserLogs()
      const storedEvents = getStoredEvents()
      
      // Add timestamp if missing
      const logsWithTimestamp = storedLogs.map(log => ({
        ...log,
        timestamp: log.timestamp || Date.now()
      }))
      
      const eventsWithTimestamp = storedEvents.map(event => ({
        ...event,
        timestamp: event.timestamp || Date.now()
      }))
      
      setLogs(logsWithTimestamp)
      setEvents(eventsWithTimestamp)
    }
    
    updateData()
    
    // Update every 2 seconds to show real-time logs
    const interval = setInterval(updateData, 2000)
    return () => clearInterval(interval)
  }, [getStoredUserLogs, getStoredEvents])

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDetails = (details: any) => {
    if (!details) return 'N/A'
    return JSON.stringify(details, null, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold text-navy">
          Activity Monitoring
        </h2>
        <Button 
          onClick={clearStoredData}
          variant="outline"
          size="sm"
        >
          Clear All Data
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-gold text-navy'
                : 'border-transparent text-navy/60 hover:text-navy/80 hover:border-gray-300'
            }`}
          >
            User Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-gold text-navy'
                : 'border-transparent text-navy/60 hover:text-navy/80 hover:border-gray-300'
            }`}
          >
            Events ({events.length})
          </button>
        </nav>
      </div>

      {/* User Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-navy">User Action Logs</h3>
            <p className="text-sm text-navy/60">Track all user actions for audit trail</p>
          </div>
          <div className="overflow-x-auto">
            {logs.length === 0 ? (
              <div className="p-6 text-center text-navy/60">
                No user logs yet. Actions will appear here as users interact with the system.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.slice().reverse().map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.userId || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.targetType && log.targetId ? `${log.targetType}:${log.targetId}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        <details className="cursor-pointer">
                          <summary className="text-gold hover:text-bronze">View Details</summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                            {formatDetails(log.details)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-navy">System Events</h3>
            <p className="text-sm text-navy/60">Track system events and user interactions</p>
          </div>
          <div className="overflow-x-auto">
            {events.length === 0 ? (
              <div className="p-6 text-center text-navy/60">
                No events yet. System events will appear here automatically.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User/Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.slice().reverse().map((event, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(event.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {event.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          event.eventCategory === 'auth' ? 'bg-purple-100 text-purple-800' :
                          event.eventCategory === 'class' ? 'bg-blue-100 text-blue-800' :
                          event.eventCategory === 'student' ? 'bg-yellow-100 text-yellow-800' :
                          event.eventCategory === 'message' ? 'bg-pink-100 text-pink-800' :
                          event.eventCategory === 'credit' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.eventCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{event.userId || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500">{event.sessionId?.slice(-8)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        <details className="cursor-pointer">
                          <summary className="text-gold hover:text-bronze">View Data</summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                            {formatDetails({ ...event.data, ...event.metadata })}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}