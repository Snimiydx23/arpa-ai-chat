"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [value]);

  const handleSend = () => {
    const text = value.trim();
    if (!text || isLoading) return;
    setValue("");
    onSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-area">
      <div className="input-box">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Kuch bhi poochhein… (Enter = bhejo, Shift+Enter = naya line)"
          rows={1}
          disabled={false}
        />
        {isLoading ? (
          <button className="send-btn send-btn--stop" onClick={onStop} title="Rokein">
            <Square size={18} />
          </button>
        ) : (
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!value.trim()}
            title="Bhejo"
          >
            <Send size={18} />
          </button>
        )}
      </div>
      <p className="input-hint">
        ARPA AI · Gemini 2.0 Flash · Galat jaankari de sakta hai
      </p>
    </div>
  );
}
