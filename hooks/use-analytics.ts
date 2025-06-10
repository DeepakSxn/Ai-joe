import { useRef } from "react"
import { collection, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  duration?: number | null
}

interface Session {
  id: string
  mode: "text-only" | "avatar"
  startTime: string
  endTime: string
  messages: Message[]
}

function cleanMessage(msg: any) {
  return Object.fromEntries(Object.entries(msg).filter(([_, v]) => v !== undefined))
}

export function useAnalytics(mode: "text-only" | "avatar") {
  const sessionRef = useRef<Session | null>(null)
  const sessionDocId = useRef<string | null>(null)

  // Call this when a session starts
  const startSession = async () => {
    const session: Session = {
      id: crypto.randomUUID(),
      mode,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      messages: [],
    }
    sessionRef.current = session
    // Add to Firestore
    const docRef = await addDoc(collection(db, "sessions"), {
      ...session,
      startTime: Timestamp.fromDate(new Date(session.startTime)),
      endTime: Timestamp.fromDate(new Date(session.endTime)),
    })
    sessionDocId.current = docRef.id
  }

  // Call this to track a message
  const trackMessage = async (message: Omit<Message, "timestamp">) => {
    if (!sessionRef.current || !sessionDocId.current) return

    // For assistant messages, check if there's already a response for the last user message
    if (message.role === "assistant") {
      const lastUserMessage = [...sessionRef.current.messages]
        .reverse()
        .find(msg => msg.role === "user")
      
      if (lastUserMessage) {
        const hasExistingResponse = sessionRef.current.messages.some(
          msg => msg.role === "assistant" && msg.timestamp > lastUserMessage.timestamp
        )
        
        if (hasExistingResponse) {
          console.warn('Duplicate assistant response detected for user message:', lastUserMessage.id)
          return
        }
      }
    }

    const messageWithTimestamp = cleanMessage({
      ...message,
      timestamp: new Date().toISOString(),
    }) as unknown as Message

    sessionRef.current.messages.push(messageWithTimestamp)
    sessionRef.current.endTime = new Date().toISOString()

    // Deep clean all messages before sending to Firestore
    const cleanedMessages = sessionRef.current.messages.map(cleanMessage)
    await updateDoc(doc(db, "sessions", sessionDocId.current), {
      messages: cleanedMessages,
      endTime: Timestamp.fromDate(new Date(sessionRef.current.endTime)),
    })
  }

  return {
    startSession,
    trackMessage,
  }
} 