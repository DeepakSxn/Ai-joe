"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // In a real app, this would be an API call to verify admin credentials
    // For demo purposes, we'll use a hardcoded admin account
    if (username === "admin" && password === "admin123") {
      // Set admin authentication cookie
      Cookies.set("isAdminAuthenticated", "true", { expires: 1 }) // Expires in 1 day
      router.push("/analytics")
    } else {
      setError("Invalid admin credentials")
    }
    setIsLoading(false)
  }

  return (
    <main className="flex flex-col min-h-screen bg-white text-black">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-2" style={{ color: "#1B1212", fontWeight: 700 }}>Admin Login</h1>
            <p className="text-lg" style={{ color: "#4A5568" }}>Access analytics dashboard</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: "#4A5568" }}>
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: "#4A5568" }}>
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#10a37f] hover:bg-[#10a37f]/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
} 