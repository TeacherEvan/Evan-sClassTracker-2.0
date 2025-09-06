export default function Home() {
  return (
    <main className="min-h-screen bg-marble flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold text-navy mb-4">
          Evan's Class Tracker 2.0
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-gold via-bronze to-silver mx-auto mb-8 gold-shimmer"></div>
        <p className="text-xl text-navy/80 max-w-2xl mx-auto leading-relaxed">
          A sophisticated platform for teachers and school moderators to seamlessly 
          track classes, manage credits, and foster educational excellence.
        </p>
        <div className="mt-12">
          <button className="bg-navy hover:bg-navy/90 text-marble px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            Get Started
          </button>
        </div>
      </div>
    </main>
  )
}