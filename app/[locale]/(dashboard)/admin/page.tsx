import UserLogsViewer from "@/components/dashboard/user-logs-viewer"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold text-navy">
          Admin Dashboard
        </h2>
        <p className="text-navy/70 mt-2">
          Manage system users, monitor activity, and oversee operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gold">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-navy/60">Total Users</p>
              <p className="text-2xl font-bold text-navy">42</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-bronze">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-navy/60">Active Sessions</p>
              <p className="text-2xl font-bold text-navy">18</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-silver">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-navy/60">Total Classes</p>
              <p className="text-2xl font-bold text-navy">127</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-navy">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-navy/60">System Health</p>
              <p className="text-2xl font-bold text-green-600">Healthy</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Logs and Event Tracking */}
      <UserLogsViewer />
    </div>
  )
}