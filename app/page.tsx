export default function Home() {
  return (
    <main className="min-h-screen bg-marble flex items-center justify-center fire-particles">
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-display font-bold mb-4 fire-text">
          Evan's Class Tracker 2.0
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-gold via-bronze to-silver mx-auto mb-8 gold-shimmer fire-glow"></div>
        <p className="text-xl text-navy/80 max-w-2xl mx-auto leading-relaxed mb-8">
          A sophisticated platform for teachers and school moderators to seamlessly 
          track classes, manage credits, and foster educational excellence.
        </p>
        <div className="fire-background-subtle p-6 rounded-lg fire-border mb-8">
          <p className="text-navy font-semibold">
            🔥 Ignite your teaching potential with our advanced tracking system 🔥
          </p>
        </div>
        <div className="mt-12">
          <button className="fire-button px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
            Get Started
          </button>
        </div>
        
        {/* Fire accent elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 fire-background rounded-full fire-flicker opacity-20"></div>
        <div className="absolute -bottom-5 -right-5 w-16 h-16 fire-background rounded-full fire-flicker opacity-15" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 -left-8 w-12 h-12 fire-background rounded-full fire-flicker opacity-10" style={{animationDelay: '1s'}}></div>
      </div>
    </main>
  )
}