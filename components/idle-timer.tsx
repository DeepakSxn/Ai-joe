"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

export default function IdleTimer() {
  const router = useRouter()
  const [showTimer, setShowTimer] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let idleTimer: NodeJS.Timeout
    let countdownTimer: NodeJS.Timeout

    const resetTimer = () => {
      setIsActive(true)
      setShowTimer(false)
      setCountdown(10)
      clearTimeout(idleTimer)
      clearInterval(countdownTimer)
    }

    const handleUserActivity = () => {
      // Only reset timer if warning is not shown
      if (isActive && !showTimer) {
        resetTimer()
        idleTimer = setTimeout(() => {
          setShowTimer(true)
          countdownTimer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownTimer)
                // Logout user
                Cookies.remove("isAuthenticated")
                router.push("/login")
                return 0
              }
              return prev - 1
            })
          }, 1000)
        }, 60000) // 1 minute
      }
    }

    // Add event listeners for user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity)
    })

    // Initial timer setup
    handleUserActivity()

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity)
      })
      clearTimeout(idleTimer)
      clearInterval(countdownTimer)
    }
  }, [router, isActive, showTimer])

  const handleStayActive = () => {
    setIsActive(true)
    setShowTimer(false)
    setCountdown(10)
  }

  if (!showTimer) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-xl font-semibold mb-2" style={{ color: "#1B1212" }}>
          Are You Still There?
        </h3>
        <p className="text-sm mb-4" style={{ color: "#4A5568" }}>
          You've been inactive for a while. To prevent automatic logout, please confirm you're still active.
        </p>
        <div className="text-center mb-4">  
          <span className="text-2xl font-bold" style={{ color: "#10a37f" }}>
            {countdown}s
          </span>
        </div>
        <Button
          onClick={handleStayActive}
          className="w-full bg-[#10a37f] hover:bg-[#10a37f]/90 text-white"
        >
          I'm Active
        </Button>
      </div>
    </div>
  )
} 