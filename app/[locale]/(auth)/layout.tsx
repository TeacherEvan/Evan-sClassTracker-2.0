export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-marble flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-navy mb-2">
            Evan's Class Tracker 2.0
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-gold via-bronze to-silver mx-auto mb-6 gold-shimmer"></div>
        </div>
        {children}
      </div>
    </div>
  )
}