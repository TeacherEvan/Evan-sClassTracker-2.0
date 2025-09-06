export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-marble fire-particles">
      <header className="bg-navy text-marble shadow-lg fire-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-display font-semibold">
              <span className="fire-text">🔥</span> Evan's Class Tracker 2.0
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, Teacher</span>
              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center fire-glow">
                <span className="text-navy font-bold text-sm">T</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="fire-background-subtle rounded-lg p-1 mb-6">
          <div className="bg-marble rounded-lg p-4">
            <p className="text-center text-navy/70 text-sm">
              ✨ Powered by cutting-edge tracking technology ✨
            </p>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}