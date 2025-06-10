"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"
import Cookies from "js-cookie"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import * as XLSX from 'xlsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  duration?: number
}

interface SessionData {
  id: string
  mode: "text-only" | "avatar"
  startTime: string
  endTime: string
  messages: Message[]
}

type TimeRange = "all" | "week" | "month" | "year"

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>("all")
  const router = useRouter()

  useEffect(() => {
    const fetchSessions = async () => {
      const querySnapshot = await getDocs(collection(db, "sessions"))
      const sessionList: SessionData[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        sessionList.push({
          id: data.id,
          mode: data.mode,
          startTime: data.startTime?.toDate ? data.startTime.toDate().toISOString() : data.startTime,
          endTime: data.endTime?.toDate ? data.endTime.toDate().toISOString() : data.endTime,
          messages: data.messages || [],
        })
      })
      setSessions(sessionList)
    }
    fetchSessions()
  }, [])

  const handleBack = () => {
    router.push("/chat")
  }

  const handleLogout = () => {
    Cookies.remove("analyticsAuth")
    router.push("/analytics/login")
  }

  const calculateTotalTime = (session: SessionData) => {
    const start = new Date(session.startTime)
    const end = new Date(session.endTime)
    return Math.round((end.getTime() - start.getTime()) / 1000) // Convert to seconds
  }

  const calculateAverageResponseTime = (session: SessionData) => {
    const assistantMessages = session.messages.filter(m => m.role === "assistant")
    if (assistantMessages.length === 0) return 0
    const totalDuration = assistantMessages.reduce((sum, msg) => sum + (msg.duration || 0), 0)
    return Math.round(totalDuration / assistantMessages.length)
  }

  const getFilteredSessions = () => {
    const now = new Date()
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime)
      switch (timeRange) {
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return sessionDate >= weekAgo
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return sessionDate >= monthAgo
        case "year":
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          return sessionDate >= yearAgo
        default:
          return true
      }
    })
    return filteredSessions
  }

  const handleDownloadExcel = () => {
    const filteredSessions = getFilteredSessions()
    // Prepare data for Excel
    const excelData = filteredSessions.map(session => ({
      'Session ID': session.id,
      'Mode': session.mode,
      'Start Time': new Date(session.startTime).toLocaleString(),
      'End Time': new Date(session.endTime).toLocaleString(),
      'Duration (s)': calculateTotalTime(session),
      'Total Messages': session.messages.length,
      'User Messages': session.messages.filter(m => m.role === 'user').length,
      'Assistant Messages': session.messages.filter(m => m.role === 'assistant').length,
    }))

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Analytics Data')

    // Generate Excel file
    XLSX.writeFile(wb, 'analytics_data.xlsx')
  }

  const filteredSessions = getFilteredSessions()

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <header className="w-full border-b border-gray-200 bg-white px-4 py-2 flex items-center justify-between shadow-sm h-16">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
          <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadExcel}
            className="text-gray-600 hover:text-gray-900"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            Logout
          </Button>
        </div>
      </header>
      <div className="flex-1 p-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredSessions.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Text-Only Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredSessions.filter(s => s.mode === "text-only").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avatar Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredSessions.filter(s => s.mode === "avatar").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredSessions.reduce((sum, session) => sum + session.messages.length, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="sessions">
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {new Date(session.startTime).toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-500">Mode</p>
                        <p className="font-medium">{session.mode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{calculateTotalTime(session)}s</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Messages</p>
                      <div className="space-y-2">
                        {session.messages.map((message) => (
                          <div
                            key={message.id}
                            className="p-2 rounded bg-gray-50 text-sm"
                          >
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>{message.role}</span>
                              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="line-clamp-2">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
} 