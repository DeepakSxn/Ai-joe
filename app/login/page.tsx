"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { LogOut } from "lucide-react"
import Cookies from "js-cookie"

// Hardcoded credentials
const VALID_EMAIL = "gerdau@gmail.com"
const VALID_PASSWORD = "gerdau@123"

// Timer duration in milliseconds (1 minute)
const TIMER_DURATION = 60 * 1000

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<number>(TIMER_DURATION)

  // Check if user is already logged in
  useEffect(() => {
    const authStatus = Cookies.get("isAuthenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
      startTimer()
    }
    setIsCheckingAuth(false)
  }, [])

  // Reset timer on user activity
  useEffect(() => {
    const resetTimer = () => {
      if (timer) {
        clearTimeout(timer)
      }
      if (isAuthenticated) {
        setTimeRemaining(TIMER_DURATION)
        startTimer()
      }
    }

    const events = ["mousemove", "keydown", "click", "scroll", "mousedown", "keypress", "touchstart"]
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [timer, isAuthenticated])

  // Update time remaining
  useEffect(() => {
    if (!isAuthenticated || !timer) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(interval)
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated, timer])

  const startTimer = () => {
    if (timer) {
      clearTimeout(timer)
    }
    setTimeRemaining(TIMER_DURATION)
    const newTimer = setTimeout(() => {
      handleLogout()
      toast({
        title: "Session expired",
        description: "You have been logged out due to inactivity",
        variant: "destructive"
      })
    }, TIMER_DURATION)
    setTimer(newTimer)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        setIsAuthenticated(true)
        Cookies.set("isAuthenticated", "true", { expires: 7 }) // Expires in 7 days
        startTimer()
        router.replace("/chat")
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })
      } else {
        throw new Error("Invalid email or password")
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsAuthenticated(false)
      Cookies.remove("isAuthenticated")
      if (timer) {
        clearTimeout(timer)
        setTimer(null)
      }
      setTimeRemaining(TIMER_DURATION)
      router.replace("/login")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  // Don't show the login page while checking authentication
  if (isCheckingAuth) {
    return null
  }

  // If already authenticated, don't show the login page
  if (isAuthenticated) {
    return null
  }

  return (
    <main className="flex flex-col h-screen bg-white text-black">
      {/* Header */}
      <header className="w-full border-b border-gray-700 bg-gray-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img 
            src="/dark.webp" 
            alt="EOXS Logo" 
            className="h-12 w-auto max-w-[180px] object-contain" 
          />
        </div>
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-300">
              Session expires in: {Math.ceil(timeRemaining / 1000)}s
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-gray-200 bg-gray-700 hover:bg-gray-600 border-gray-600"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        )}
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: "#1B1212" }}>Welcome to Joe 2.0</h1>
            <h2 className="text-2xl font-semibold" style={{ color: "#4A5568" }}>Please login to continue</h2>
          </div>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#10a37f] bg-white">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium" style={{ color: "#2D3748" }}>
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium" style={{ color: "#2D3748" }}>
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#10a37f] hover:bg-[#10a37f]/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>

          
        </div>
      </div>
    </main>
  )
} 