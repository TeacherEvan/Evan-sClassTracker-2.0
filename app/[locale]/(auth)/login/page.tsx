"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, LogIn } from "lucide-react"
import { useEventTracker } from "@/lib/event-tracker"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { trackPageView, trackLogin, logUserAction } = useEventTracker()

  useEffect(() => {
    trackPageView('/login')
  }, [trackPageView])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Log login attempt
    logUserAction({
      userId: email, // Using email as temporary userId
      action: 'login_attempt',
      details: { metadata: { email } }
    })
    
    // TODO: Implement actual authentication logic with Convex
    console.log("Login attempt:", { email, password })
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      
      // Simulate successful login
      const userId = `user_${Date.now()}`
      trackLogin(userId)
      
      logUserAction({
        userId,
        action: 'login_success',
        details: { metadata: { email, loginTime: new Date().toISOString() } }
      })
      
      // In a real app, redirect to dashboard
      console.log("Login successful!")
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-semibold text-navy">
          Welcome Back
        </h2>
        <p className="text-navy/70 mt-2">
          Sign in to access your dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@school.edu"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-navy/50" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-navy/50" />
                )}
              </button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-navy/20 border-t-navy rounded-full animate-spin mr-2" />
          ) : (
            <LogIn className="w-4 h-4 mr-2" />
          )}
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-navy/60">
          Having trouble? Contact your administrator for assistance.
        </p>
        <p className="text-xs text-navy/40 mt-2">
          Note: This is a demo - login attempts are tracked for demonstration
        </p>
      </div>
    </div>
  )
}