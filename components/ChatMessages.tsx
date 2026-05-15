"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import { formatTime } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessagesProps {
  messages: Message[];
  streamingText: string;
  isLoading: boolean;
}

export default function ChatMessages({
  messages,
  streamingText,
  isLoading,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⬡</div>
        <h2 className="empty-state-title">ARPA AI Chat</h2>
        <p className="empty-state-subtitle">
          Kuch bhi poochhein — main hamesha ready hoon
        </p>
        <div className="suggestion-chips">
          {[
            "🧠 AI ke baare mein batao",
            "📝 Ek poem likho",
            "💡 Business idea do",
            "🔧 Code help chahiye",
          ].map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="messages-area">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`message-row ${msg.role === "user" ? "message-row--user" : "message-row--ai"}`}
        >
          <div className="message-avatar">
            {msg.role === "user" ? (
              <User size={16} />
            ) : (
              <Bot size={16} />
            )}
          </div>
          <div className="message-bubble">
            {msg.role === "assistant" ? (
              <div className="markdown-body">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <p>{msg.content}</p>
            )}
            <span className="message-time">{formatTime(new Date(msg.createdAt))}</span>
          </div>
        </div>
      ))}

      {/* Streaming message */}
      {(isLoading || streamingText) && (
        <div className="message-row message-row--ai">
          <div className="message-avatar">
            <Bot size={16} />
          </div>
          <div className="message-bubble message-bubble--streaming">
            {streamingText ? (
              <div className="markdown-body">
                <ReactMarkdown>{streamingText}</ReactMarkdown>
              </div>
            ) : (
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
