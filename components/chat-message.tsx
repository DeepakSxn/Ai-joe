"use client";

import { cn } from "@/lib/utils";
import type { Message } from "ai";
import { User, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatMessageProps {
  message: Message;
  isSpeaking: boolean;
  triggerSync?: boolean;
  durationMs?: number;
  stopTypingSignal?: boolean;
}

export default function ChatMessage({
  message,
  isSpeaking,
  triggerSync = false,
  durationMs,
  stopTypingSignal = false
}: ChatMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const isUser = message.role === "user";
  const fullContent = message.content ?? "";
  const words = fullContent.split(/\s+/).filter(Boolean);

  const wordIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Typing animation
  useEffect(() => {
    if (!isUser && isSpeaking && triggerSync && fullContent) {
      setDisplayedContent("");
      wordIndexRef.current = 0;
      setIsTyping(true);

      const delayPerWord =
        durationMs && words.length > 0 ? durationMs / words.length : 300;

      intervalRef.current = setInterval(() => {
        const word = words[wordIndexRef.current];
        if (typeof word === "string") {
          setDisplayedContent((prev) => prev + word + " ");
        }

        wordIndexRef.current++;

        if (wordIndexRef.current >= words.length && intervalRef.current) {
          clearInterval(intervalRef.current);
          setIsTyping(false);
        }
      }, delayPerWord);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSpeaking, triggerSync, durationMs, fullContent]);

  // Stop signal
  useEffect(() => {
    if (stopTypingSignal && intervalRef.current) {
      clearInterval(intervalRef.current);
      setDisplayedContent(prev => prev.trim()); // stop at current point
      setIsTyping(false);
    }
  }, [stopTypingSignal]);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl p-3 shadow-sm",
          isUser
            ? "bg-eoxs-green text-white rounded-tr-none"
            : "bg-white dark:bg-gray-800 text-black dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-700"
        )}
      >
        <div className="flex items-start gap-2">
          {!isUser && (
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white flex-shrink-0 mt-0.5 border border-gray-200">
              <img src="/pic.png" alt="Joseph Malchar" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div
              className={cn(
                "text-xs font-medium mb-1",
                isUser ? "text-white/90" : "text-eoxs-green dark:text-eoxs-green/90"
              )}
            >
              {isUser ? "You": "Joseph Malchar"}
            </div>

            <div className="text-sm whitespace-pre-wrap break-words">
              {isUser ? (
                fullContent
              ) : fullContent === "" && !isTyping ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Joe is thinking...</span>
                </div>
              ) : (
                displayedContent
              )}
            </div>
          </div>

          {isUser && (
            <div className="w-6 h-6 rounded-full o verflow-hidden bg-eoxs-green/80 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/20">
              <User className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
